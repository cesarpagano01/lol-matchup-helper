import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  await knex("config").del();

  await knex("config").insert([
    { key: "PATCH_VERSION", value: "14.1.1" },
    { key: "LANGUAGE", value: "pt_BR" }
  ]);
  
  console.log("✅ Tabela config alimentada com sucesso!");
};