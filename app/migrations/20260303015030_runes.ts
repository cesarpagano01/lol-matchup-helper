import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('runes', (table) => {
        table.uuid('rune_id').primary().defaultTo(knex.raw('uuid_generate_v4()'))
        table.string('name').notNullable()
        table.string('icon').notNullable()
        table.string('description').nullable()
        table.timestamps(true, true)
    })
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable('runes')
}

