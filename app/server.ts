import express from 'express'
import database from './database'
import cron from 'node-cron'

const app = express()
app.use(express.json())

// --- FUNÇÃO DE ATUALIZAÇÃO REUTILIZÁVEL ---
async function updateRiotData() {
  console.log(`[${new Date().toISOString()}] Iniciando processo de atualização...`);

  try {
    // 1. Busca configurações básicas
    const config = await database('config').select('key', 'value');
    const getConfig = (key: string) => config.find(c => c.key === key)?.value;

    const currentPatch = getConfig('PATCH_VERSION') || '16.5.1';
    const language = getConfig('LANGUAGE') || 'pt_BR';

    // 2. Busca a versão mais recente da Riot
    const vRes = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');
    const versions = await vRes.json();
    const latestVersion = versions[0];

    // 3. Busca dados dos campeões
    const response = await fetch(`https://ddragon.leagueoflegends.com/cdn/${latestVersion}/data/${language}/champion.json`);
    if (!response.ok) throw new Error('Falha ao buscar dados da Riot');

    const data: any = await response.json();
    const championsArray = Object.values(data.data);

    // Início da Transação para garantir segurança dos dados
    await database.transaction(async (trx) => {
      for (const champion of championsArray as any[]) {
        
        const existingChamp = await trx('champions')
          .where('name', champion.name)
          .first();

        if (existingChamp) {
          // --- LOGICA DE COMPARAÇÃO E UPDATE ---
          const currentStatus = await trx('status')
            .where('status_id', existingChamp.status_id)
            .first();

          const newStats = {
            hp: champion.stats.hp,
            hp_per_level: champion.stats.hpperlevel,
            mana: champion.stats.mp,
            mana_per_level: champion.stats.mpperlevel,
            move_speed: champion.stats.movespeed,
            armor: champion.stats.armor,
            armor_per_level: champion.stats.armorperlevel,
            spell_block: champion.stats.spellblock,
            spell_block_per_level: champion.stats.spellblockperlevel,
            attack_range: champion.stats.attackrange,
            attack_damage: champion.stats.attackdamage,
            attack_damage_per_level: champion.stats.attackdamageperlevel,
          };

          // Verifica se algo mudou nos status
          const statsChanged = Object.keys(newStats).some(
            (key) => (currentStatus as any)[key] !== (newStats as any)[key]
          );

          // Verifica se o ícone mudou
          const newIcon = `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/champion/${champion.id}.png`;
          const iconChanged = existingChamp.icon !== newIcon;

          if (statsChanged || iconChanged) {
            console.log(`[UPDATE] Mudança em ${champion.name}. Gerando histórico...`);

            // 1. Salva histórico
            await trx('champion_history').insert({
              champion_id: existingChamp.champion_id,
              champion_history: JSON.stringify({
                status_anteriores: currentStatus,
                icon_anterior: existingChamp.icon
              }),
              patch: existingChamp.patch
            });

            // 2. Atualiza Status
            await trx('status')
              .where('status_id', existingChamp.status_id)
              .update({
                ...newStats,
                patch: latestVersion
              });

            // 3. Atualiza Campeão
            await trx('champions')
              .where('champion_id', existingChamp.champion_id)
              .update({
                icon: newIcon,
                patch: latestVersion
              });
          } else {
            // Se não mudou nada, apenas atualiza a marcação de patch
            await trx('champions').where('champion_id', existingChamp.champion_id).update({ patch: latestVersion });
            await trx('status').where('status_id', existingChamp.status_id).update({ patch: latestVersion });
          }

        } else {
          // --- SE O CAMPEÃO FOR NOVO (INSERT) ---
          const [newStatus] = await trx('status').insert({
            hp: champion.stats.hp,
            hp_per_level: champion.stats.hpperlevel,
            mana: champion.stats.mp,
            mana_per_level: champion.stats.mpperlevel,
            move_speed: champion.stats.movespeed,
            armor: champion.stats.armor,
            armor_per_level: champion.stats.armorperlevel,
            spell_block: champion.stats.spellblock,
            spell_block_per_level: champion.stats.spellblockperlevel,
            attack_range: champion.stats.attackrange,
            attack_damage: champion.stats.attackdamage,
            attack_damage_per_level: champion.stats.attackdamageperlevel,
            ability_power: 0,
            cooldown_reduction: 0.0,
            patch: latestVersion
          }).returning('status_id');

          const sId = (newStatus as any).status_id || newStatus;

          await trx('champions').insert({
            name: champion.name,
            icon: `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/champion/${champion.id}.png`,
            status_id: sId,
            patch: latestVersion
          });
        }
      }

      // Finaliza atualizando a versão global
      await trx('config')
        .where('key', 'PATCH_VERSION')
        .update({ value: latestVersion });
    });

    return championsArray.length;
  } catch (error) {
    console.error('Erro no processo de atualização:', error);
    throw error;
  }
}

// --- CRON JOB ---
cron.schedule('0 12 * * 3', async () => {
  await updateRiotData();
});

// --- ROTAS ---
app.get('/import', async (req, res) => {
  try {
    const count = await updateRiotData();
    return res.status(200).json({ message: 'Processado com sucesso!', count });
  } catch (error) {
    return res.status(500).json({ error: 'Erro na importação' });
  }
});

app.get('/champions', async (req, res) => {
  try {
    const data = await database('champions')
      .select('champions.name', 'champions.icon', 'status.hp', 'status.attack_damage')
      .join('status', 'champions.status_id', 'status.status_id');
    return res.json(data);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao buscar' });
  }
});

app.listen(3000, () => {
  console.log(`Server rodando em http://localhost:3000 - ${new Date()}`);
});
