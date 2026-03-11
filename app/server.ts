import express from 'express'
import database from './database'
import cron from 'node-cron'

const app = express()
app.use(express.json())

async function updateRiotData() {
  console.log(`[${new Date().toISOString()}] Iniciando processo de atualização...`)

  try {
    await fetchLatestPatchVersionFromLeagueApiAndSaveToDatabase()
    const { PATCH_VERSION: patch, LANGUAGE: language }: any = getPatchAndLanguageFromConfigs()

    const championsFromDdragon: any[] = await fetchChampionsDataFromLeagueApiAndReturnChampionsArray(patch, language)

    await upsertChampionsWithinTransaction(championsFromDdragon, patch)

    return championsFromDdragon.length
  } catch (error) {
    console.error('Erro no processo de atualização:', error)
    throw error
  }
}

async function upsertChampionsWithinTransaction(championsArray: any[], patch: string) {
  await database.transaction(async (trx) => {
    for (const champion of championsArray) {
      const iconUrl = `https://ddragon.leagueoflegends.com/cdn/${patch}/img/champion/${champion.id}.png`

      const statusObjectToUpsert = {
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
        patch: patch
      }

      const [status] = await trx('status')
        .insert(statusObjectToUpsert)
        .onConflict('status_id')
        .merge(statusObjectToUpsert)
        .returning('status_id')

      const championObjectToUpsert = {
        name: champion.name,
        icon: iconUrl,
        patch: patch,
        status_id: status.status_id
      }

      await trx('champions')
        .insert(championObjectToUpsert)
        .onConflict('champion_id')
        .merge(championObjectToUpsert)
    }
  })
}

async function fetchLatestPatchVersionFromLeagueApiAndSaveToDatabase() {
  const response = await fetch('https://ddragon.leagueoflegends.com/api/versions.json')
  const [versions]: any = await response.json()
  const latestVersion = versions

  await database('config')
    .where('key', 'PATCH_VERSION')
    .update({ value: latestVersion })
}

// isso aqui, vai ficar dentro de um arquivo "client da ddragon, do lol, tanto faz" (Entender como funciona uma classe)
async function fetchChampionsDataFromLeagueApiAndReturnChampionsArray(patch: any, language: any): Promise<any[]> {
  const response = await fetch(`https://ddragon.leagueoflegends.com/cdn/${patch}/data/${language}/champion.json`)
  if (!response.ok) {
    throw new Error('Falha ao buscar dados da Riot')
  }

  const data: any = await response.json()
  return Object.values(data.data)
}

// vai vicar dentro de um arquivo "helper"
async function getPatchAndLanguageFromConfigs() {
  const configs = await database('config')
    .select('key', 'value')
    .whereIn('key', ['PATCH_VERSION', 'LANGUAGE'])
  // const configs = [ { key: "PATCH_VERSION", value: '1.0' }, { key: 'LANGUAGE', value: 'pt_BR' } ]

  return configs.reduce(
    (result, config) => {
      // config = { key: "PATCH_VERSION", value: '1.0' }
      // result = eu declarei ali em baixo que é um {} objeto vazio!

      result[config.key] = config.value
      return result
    },
    {} // declarei aqui
  )
  // result = { "PATCH_VERSION": '1.0', "LANGUAGE": 'pt_BR' }
}

// --- CRON JOB ---
cron.schedule('0 12 * * 3', async () => {
  await updateRiotData()
})

// --- ROTAS ---
app.get('/import', async (req, res) => {
  try {
    const count = await updateRiotData()
    return res.status(200).json({ message: 'Processado com sucesso!', count })
  } catch (error) {
    return res.status(500).json({ error: 'Erro na importação' })
  }
})

app.get('/champions', async (req, res) => {
  try {
    const data = await database('champions')
      .select('champions.name', 'champions.icon', 'status.hp', 'status.attack_damage')
      .join('status', 'champions.status_id', 'status.status_id')
    return res.json(data)
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao buscar' })
  }
})

app.listen(3000, () => {
  console.log(`Server rodando em http://localhost:3000 - ${new Date()}`)
})
