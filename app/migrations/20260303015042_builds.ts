import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('builds', (table) => {
        table.uuid('build_id').primary().defaultTo(knex.raw('uuid_generate_v4()'))
        table.uuid('item_1_id').references('items.item_id').nullable()
        table.uuid('item_2_id').references('items.item_id').nullable()
        table.uuid('item_3_id').references('items.item_id').nullable()
        table.uuid('item_4_id').references('items.item_id').nullable()
        table.uuid('item_5_id').references('items.item_id').nullable()
        table.uuid('item_6_id').references('items.item_id').nullable()
        table.uuid('item_7_id').references('items.item_id').nullable()
        table.uuid('spell_1_id').references('spells.spell_id').nullable()
        table.uuid('spell_2_id').references('spells.spell_id').nullable()
        table.uuid('rune_page_id').references('rune_pages.rune_page_id').nullable()
        table.timestamps(true, true)
    })
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable('builds')
}
