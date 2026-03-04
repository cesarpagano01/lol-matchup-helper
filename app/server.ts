import express from 'express'
import database from './database'

const app = express()

app.use(express.json())

app.listen(3000, () => {
  const date = new Date()
  console.log(`Server OK! - ${date}`) 
})

const PATCH_VERSION: string = '16.5.1'
const LANGUAGE: string = 'pt_BR'

app.get('/import', async (req, res) => {
  try {
    const response = await fetch(`https://ddragon.leagueoflegends.com/cdn/${PATCH_VERSION}/data/${LANGUAGE}/champion.json`);

    if (!response.ok) {
      return res.status(500).json({ error: 'Falha ao buscar dados externos' });
    }

    const data: any = await response.json();
    const championsArray = Object.values(data.data);

    // Adicionando o (trx) para caso houver algum erro na migração, o banco faz um "rollback" automático e apaga tudo que tinha sido enviado até então, garantindo que não haverão inconsistencias no banco
    await database.transaction(async (trx) => {
      
      // Usando a "array" buscamos todos os status de uma vez sem precisar ficar "indo e vindo"
      const statusToInsert = championsArray.map((champion: any) => ({
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
      }));

      // Insere todos os status de uma vez e recupera os IDs gerados
      const insertedStatus = await trx('status')
        .insert(statusToInsert)
        .returning('status_id');

      // 2. Prepara todos os campeões vinculando ao status_id correto
      const championsToInsert = championsArray.map((champion: any, index: number) => ({
        name: champion.name,
        icon: `https://ddragon.leagueoflegends.com/cdn/${PATCH_VERSION}/img/champion/${champion.id}.png`,
        status_id: insertedStatus[index].status_id
      }));

      // Insere todos os campeões de uma vez
      await trx('champions').insert(championsToInsert);
      console.log('Transação concluída com sucesso!');
    });

    return res.status(200).json({
      message: 'Importação concluída com alta performance e atomicidade!',
      count: championsArray.length
    });

  } catch (error) {
    console.error('Erro na importação (Rollback executado automaticamente):', error);
    return res.status(500).json({ error: 'Erro interno na importação' });
  }
});

app.get('/champions', async (request, response) => {
  try {
    const users = await database('champions')
      .select([
        'champions.name',
        'champions.icon',
        'status.ability_power',
        'status.attack_damage',
        'status.cooldown_reduction',
        'status.hp'
        'status.hp_per_level'
        'status.mana'
        'status.mana_per_level'
        'status.move_speed'
        'armor'
        'armor_per_level'
        'spell_block'
        'spell_block_per_level'
        'attack_range'
        'attack_damage_per_level'
      ])
      .join('status', 'champions.status_id', 'status.status_id')
    return response.json(users);
  } catch (error) {
    response.status(500).json({ error: 'Erro ao buscar usuários' });
  }
})

