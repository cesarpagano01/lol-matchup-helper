import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('champion_history', (table) => {
        table.uuid('champion_history_id').primary().defaultTo(knex.raw('uuid_generate_v4()'))
        table.jsonb('champion_history').defaultTo({}).notNullable()
        table.uuid('champion_id').references('champions.champion_id').nullable()
        table.string('patch').notNullable()
    })
}


export async function down(knex: Knex): Promise<void> {
}

