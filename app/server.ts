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
  try{
    const response: Response = await fetch(`https://ddragon.leagueoflegends.com/cdn/${PATCH_VERSION}/data/${LANGUAGE}/champion.json`)

    if (! response.ok) {
      return res.status(500).json({ error: 'Falha ao buscar dados externos' })
    }

    const data: any = await response.json()

    const champions = data.data
    
    Object.values(champions).forEach(async (champion: any) => {
      const status = await database('status').insert({
        ability_power: 0,
        attack_damage: champion.stats.attackdamage,
        cooldown_reduction: 0.0,
      }).returning('status_id')

      await database('champions').insert({
        name: champion.name,
        icon: `https://ddragon.leagueoflegends.com/cdn/${PATCH_VERSION}/img/champion/${champion.name}.png`,
        status_id: status[0].status_id
      })
    })

    return res.status(200).json({
      message: 'Importação concluída!',
      count: champions.length
    })
  } catch (error) {
    console.error('Erro na importação:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
})

app.get('/champions', async (request, response) => {
  try {
    const users = await database('champions')
      .select([
        'champions.name',
        'champions.icon',
        'status.ability_power',
        'status.attack_damage',
        'status.cooldown_reduction',
      ])
      .join('status', 'champions.status_id', 'status.status_id')
    return response.json(users);
  } catch (error) {
    response.status(500).json({ error: 'Erro ao buscar usuários' });
  }
})
