import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('items', (table) => {
    table.uuid('item_id').primary().defaultTo(knex.raw('uuid_generate_v4()'))
    table.string('name').notNullable()
    table.string('icon').notNullable()
    table.integer('price').notNullable()
    table.double('passive_cooldown', 6, 2).nullable()
    table.string('passive_description').nullable()
    table.double('active_cooldown', 6, 2).nullable()
    table.string('active_description').nullable()
    table.uuid('status_id').references('status.status_id').nullable()
    table.timestamps(true, true)
  })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('items')
}
