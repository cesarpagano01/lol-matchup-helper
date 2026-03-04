import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('status', (table) => {
    table.uuid('status_id').primary().defaultTo(knex.raw('uuid_generate_v4()'))
    table.integer('ability_power').nullable()
    table.integer('attack_damage').nullable()
    table.double('cooldown_reduction', 6, 3).nullable()
    table.integer('hp').notNullable()
    table.double('hp_per_level', 6, 3).notNullable()
    table.integer('mana').notNullable()
    table.double('mana_per_level', 6, 3).notNullable()
    table.integer('move_speed').notNullable()
    table.double('attack_range', 6, 3).notNullable()
    table.double('armor', 6, 3).notNullable()
    table.double('armor_per_level', 6, 3).notNullable()
    table.double('spell_block', 6, 3).notNullable()
    table.double('spell_block_per_level', 6, 3).notNullable()
    table.double('attack_damage_per_level', 6, 3).notNullable()
    table.timestamps(true, true)
  })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('status')
}
