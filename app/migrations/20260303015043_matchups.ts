import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('matchups', (table) => {
        table.uuid('matchup_id').primary().defaultTo(knex.raw('uuid_generate_v4()'))
        table.uuid('champion_1_id').references('champions.champion_id').nullable()
        table.uuid('champion_2_id').references('champions.champion_id').nullable()
        table.uuid('build_id').references('builds.build_id').nullable()
        table.integer('winrate').notNullable()
        table.uuid('skill_priority_id').references('skills_priority.skill_priority_id').nullable()
        table.enum('lane', ['top', 'jungle', 'mid', 'adc', 'sup']).notNullable()
        table.string('tip').notNullable()
        table.timestamps(true, true)
    })
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable('matchups')
}

