import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('rune_pages', (table) => {
        table.uuid('rune_page_id').primary().defaultTo(knex.raw('uuid_generate_v4()'))
        table.uuid('rune_1_id').references('runes.rune_id').nullable()
        table.uuid('rune_2_id').references('runes.rune_id').nullable()
        table.uuid('rune_3_id').references('runes.rune_id').nullable()
        table.uuid('rune_4_id').references('runes.rune_id').nullable()
        table.uuid('rune_5_id').references('runes.rune_id').nullable()
        table.uuid('rune_6_id').references('runes.rune_id').nullable()
        table.uuid('rune_7_id').references('runes.rune_id').nullable()
        table.uuid('rune_8_id').references('runes.rune_id').nullable()
        table.timestamps(true, true)
    })
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable('rune_pages')
}

