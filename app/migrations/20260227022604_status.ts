import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('status', (table) => {
    table.uuid('status_id').primary().defaultTo(knex.raw('uuid_generate_v4()'))
    table.integer('ability_power').nullable()
    table.integer('attack_damage').nullable()
    table.double('cooldown_reduction', 2, 4).nullable()
    table.timestamps(true, true)
  })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('status')
}
