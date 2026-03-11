import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('config', (table) => {
        table.uuid('config_id').primary().defaultTo(knex.raw('uuid_generate_v4()'))
        table.string('key').notNullable()
        table.string('value').notNullable()
    })

}

export async function down(knex: Knex): Promise<void> {
}
