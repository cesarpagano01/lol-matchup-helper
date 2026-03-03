import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('skills_priority', (table) => {
        table.uuid('skill_priority_id').primary().defaultTo(knex.raw('uuid_generate_v4()'))
        table.uuid('champion_id').references('champions.champion_id').nullable()
        table.uuid('skill_1_id').references('skills.skill_id').nullable()
        table.uuid('skill_2_id').references('skills.skill_id').nullable()
        table.uuid('skill_3_id').references('skills.skill_id').nullable()
        table.uuid('skill_4_id').references('skills.skill_id').nullable()
        table.timestamps(true, true)
    })
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable('skills_priority')
}

