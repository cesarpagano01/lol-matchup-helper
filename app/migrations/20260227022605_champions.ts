import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('champions', (table) => {
    table.uuid('champion_id').primary().defaultTo(knex.raw('uuid_generate_v4()'))
    table.string('name').notNullable().unique()
    table.string('icon').nullable()
    table.jsonb('skins').defaultTo({}).notNullable()
    table.uuid('status_id').references('status.status_id').nullable()
    table.timestamps(true, true)
  })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('champions')
}
