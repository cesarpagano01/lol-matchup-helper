import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('spells', (table) => {
        table.uuid('spell_id').primary().defaultTo(knex.raw('uuid_generate_v4()'))
        table.string('name').notNullable()
        table.string('icon').notNullable()
        table.double('cooldown', 6, 2).nullable()
        table.string('description').nullable()
        table.timestamps(true, true)
    })
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable('spells')
}
