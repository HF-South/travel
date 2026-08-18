/* ============================================================
   YOUR TRAVEL DATA
   ------------------------------------------------------------
   This is the only file you should need to edit by hand.
   Just add entries to the lists below — the site rebuilds
   itself from this automatically. Save the file and refresh
   your browser to see changes.

   Hikes are normally filled in automatically by running
   update_hikes.py (see the README), which pulls from your
   Komoot profile.

   Trips can be filled in automatically by running
   import_trips.py against a Polarsteps data export (see the
   README) — or just add/edit them here by hand.
   ============================================================ */

const SITE_DATA = {

  /* ----------------------------------------------------------
     0. YOUR NAME / SITE TITLE
  ---------------------------------------------------------- */
  profile: {
    name: "Sam",
    tagline: "Exploring everythingg",
  },

  /* ----------------------------------------------------------
     1. COUNTRIES YOU'VE VISITED
     Just the country name. Spelling should match the list in
     script.js (COUNTRY_COORDS) so it can be placed on the map —
     if a country you add doesn't show up as a pin, open
     script.js and add its coordinates to that table.
  ---------------------------------------------------------- */
  countries: [
    "Netherlands",
    "Belgium",
    "Germany",
    "France",
    "Italy",
    "Switzerland",
    "Thailand",
    "Spain",
    "Portugal",
    "Denmark",
    "Poland",
    "Indonesia",
    "Luxembourg",
    "Vatican City",
    "Bonaire",
    "Curaçao",
    "Ireland",
  ],

  /* ----------------------------------------------------------
     2. TRIPS
     Each trip gets its own page automatically (just click the
     card). Fields:

       title        - trip name
       country      - shown on the card
       year         - used for sorting, newest first
       season       - e.g. "Summer", optional
       description  - short teaser shown on the trip card
       narrative    - longer story shown on the trip's own page
                       (optional — falls back to description)
       coverImage   - main photo URL for the card + page header
       images       - array of more photo URLs for the gallery
       highlights   - array of short strings, shown as a list
                       on the trip page (optional)
       distanceKm   - optional, shown as a stat on the trip page
       days         - optional, shown as a stat on the trip page

     Only "title" is required — leave anything else out and it's
     just skipped on the page.

     Running import_trips.py (see README) fills in a block here
     automatically from a Polarsteps export. Anything you add
     outside that block is left alone by the script.
  ---------------------------------------------------------- */
  trips: [
    /* --- POLARSTEPS SYNC START (do not edit this block by hand — it gets overwritten by import_trips.py) --- */
    {
      title: "Bali 🇮🇩",
      country: "",
      year: 2019,
      season: "",
      description: "Bali",
      narrative: "Bali",
      coverImage: "user_data/trip/bali_22606721/tabanan_202771175/photos/c941d0ee-8871-4be3-9d54-78c6b2804224_75b0d54e-5177-4f3f-ae98-f824d33d3e5d.jpg.jpg",
      images: [],
      highlights: [],
      distanceKm: 0,
      days: 18,
    },
    {
      title: "Bali 🇮🇩",
      country: "",
      year: 2018,
      season: "",
      description: "Bali",
      narrative: "Bali",
      coverImage: "user_data/trip/bali_22606779/tabanan_202772115/photos/c58ba09c-af40-4488-9d37-ece5dbf890d6_da30b9b4-5458-4c19-8f5d-fa45d95c9a59.jpg.jpg",
      images: [],
      highlights: [],
      distanceKm: 0,
      days: 18,
    },
    {
      title: "Beetje europa",
      country: "",
      year: 2026,
      season: "",
      description: "",
      narrative: "",
      coverImage: "",
      images: [],
      highlights: [],
      distanceKm: 0,
      days: 32,
    },
    {
      title: "Bonaire 🇧🇶",
      country: "",
      year: 2021,
      season: "",
      description: "Bonaire 🇧🇶",
      narrative: "Bonaire 🇧🇶",
      coverImage: "user_data/trip/bonaire_22606904/bonaire_202773955/photos/597c6d46-93d1-40b7-8533-6da404a010fb_55be3e66-90d7-4873-9fd2-382f075e5464.jpg.jpg",
      images: [],
      highlights: [],
      distanceKm: 0,
      days: 10,
    },
    {
      title: "Bootje varen",
      country: "",
      year: 2025,
      season: "",
      description: "Bootje varen",
      narrative: "Bootje varen",
      coverImage: "user_data/trip/bootje-varen_22606950/aire-sur-la-lys_202778028/photos/f2c9c964-0162-4d50-90dc-ffc668faea83_e9824e17-23ec-4234-be03-196f6980cf75.jpg.jpg",
      images: ["user_data/trip/bootje-varen_22606950/dordrecht_202815007/photos/fb69cc73-9cfc-43ad-8c9a-2b660339fa4f_746cd423-aa12-463f-ab8c-614472144c2c.jpg.jpg", "user_data/trip/bootje-varen_22606950/dordrecht_202815007/photos/55fbf585-d762-4d03-bd3c-578afe29c159_5f32899a-a530-498a-b85f-2454b0f44a96.jpg.jpg", "user_data/trip/bootje-varen_22606950/tollebeek_202812266/photos/f6f90191-396c-4991-960c-dd38f9b7db49_2c06f09b-f400-4dcf-ad17-9b5f4d4218d1.jpg.jpg", "user_data/trip/bootje-varen_22606950/tollebeek_202812266/photos/5c1ee2cc-5afc-4947-be1a-47bfaf5154a8_79da43dc-eb74-4918-b827-8f036016c7bb.jpg.jpg", "user_data/trip/bootje-varen_22606950/weesp_202907564/photos/3b77738a-405e-4927-947c-35e9b598d295_65541e77-9738-4a15-a47e-eb2ff07cf696.jpg.jpg", "user_data/trip/bootje-varen_22606950/lemmer_203308290/photos/c1d9822e-3404-4665-ac2a-b161d0e7b874_6ee1ff91-2cd7-49c6-b2b4-1ef6077d1be3.jpg.jpg", "user_data/trip/bootje-varen_22606950/moerdijk_202907756/photos/f4af5de0-2738-4541-8257-f09a8480f0bb_0cd94e61-e19d-4489-be08-c750384d2704.jpg.jpg"],
      highlights: [],
      distanceKm: 0,
      days: 258,
    },
    {
      title: "Curaçao 🇨🇼",
      country: "",
      year: 2022,
      season: "",
      description: "Curaçao 🇨🇼",
      narrative: "Curaçao 🇨🇼",
      coverImage: "user_data/trip/curacao_22606833/curacao_202772823/photos/20266ce9-6cbc-4670-96f7-2604ebe267f4_842e543c-0985-4a2d-be8a-a81aeae5e938.jpg.jpg",
      images: [],
      highlights: [],
      distanceKm: 0,
      days: 18,
    },
    {
      title: "Curaçao 🇨🇼",
      country: "",
      year: 2024,
      season: "",
      description: "Curaçao 🇨🇼",
      narrative: "Curaçao 🇨🇼",
      coverImage: "user_data/trip/curacao_22606878/curacao_202773488/photos/35b47ade-44eb-4590-8177-f556d2693d8f_5b47a83f-4b5e-4f61-9d5c-dbb470331bb2.jpg.jpg",
      images: [],
      highlights: [],
      distanceKm: 0,
      days: 19,
    },
    {
      title: "Italië 🇮🇹 Duitsland 🇩🇪 Polen 🇵🇱",
      country: "",
      year: 2023,
      season: "",
      description: "Rondreis",
      narrative: "Rondreis",
      coverImage: "user_data/trip/italie-duitsland-polen_22606845/krakow_202773168/photos/320ac9cb-4875-43ef-ba83-b70439073b24_632d9049-cac3-4531-ba7f-dbb8450e6e23.jpg.jpg",
      images: [],
      highlights: [],
      distanceKm: 0,
      days: 14,
    },
    {
      title: "Italië",
      country: "",
      year: 2017,
      season: "",
      description: "",
      narrative: "",
      coverImage: "",
      images: [],
      highlights: [],
      distanceKm: 0,
      days: 8,
    },
    {
      title: "Koh samui 🇹🇭",
      country: "",
      year: 2022,
      season: "",
      description: "Thailand 🇹🇭",
      narrative: "Thailand 🇹🇭",
      coverImage: "user_data/trip/koh-samui_22606744/ko-samui_202771577/photos/5bbc5748-35e5-4098-a3dd-1ddbfd2e1521_f1a514c2-965b-4cd2-86ad-5d9a84a1c1c6.jpg.jpg",
      images: [],
      highlights: [],
      distanceKm: 0,
      days: 17,
    },
    {
      title: "Krakow 🇵🇱",
      country: "",
      year: 2018,
      season: "",
      description: "🇵🇱",
      narrative: "🇵🇱",
      coverImage: "user_data/trip/krakow_22606915/breda_202774224/photos/60cf1a05-158d-478b-b3a9-f4224b43c765_cc32a2f3-98a4-4cd2-bfe4-de004b254ae0.jpg.jpg",
      images: [],
      highlights: [],
      distanceKm: 0,
      days: 5,
    },
    {
      title: "Lissabon 🇵🇹",
      country: "",
      year: 2023,
      season: "",
      description: "Lissabon 🇵🇹",
      narrative: "Lissabon 🇵🇹",
      coverImage: "user_data/trip/lissabon_22606867/lisbon_202773350/photos/90717c41-bd39-4fd7-b9c5-fe87316092cd_c67e0189-8e74-4e6f-a775-8e5ff6fceee3.jpg.jpg",
      images: [],
      highlights: [],
      distanceKm: 0,
      days: 7,
    },
    {
      title: "Luxemburg",
      country: "",
      year: 2026,
      season: "",
      description: "",
      narrative: "",
      coverImage: "user_data/trip/luxemburg_28109239/etten-leur_258287955/photos/92da457e-f544-4fc7-8329-4550d6c4354a_6b140fde-99ab-44e4-b865-e8b5ff6f4269.jpg.jpg",
      images: ["user_data/trip/luxemburg_28109239/eghezee_258339718/photos/73a1676e-30d5-414c-994e-c3396afd6b87_71271d6f-3b3e-4566-b18b-2efd1e8e367c.jpg.jpg", "user_data/trip/luxemburg_28109239/luxembourg_258374319/photos/8a49c90a-c21d-456a-a4b8-f82f9cb09353_60ae0cb0-1a6b-47f4-85c9-cc1cff433cd4.jpg.jpg", "user_data/trip/luxemburg_28109239/luxembourg_258374319/photos/e5b2d1ec-bf5b-4943-9dd2-6d451258da97_c4f7dc0a-f898-4303-acb8-e566d349bb42.jpg.jpg", "user_data/trip/luxemburg_28109239/luxembourg_258374319/photos/556e428d-0da6-4e99-bf78-f12f93c9c316_501c1113-3b83-46f4-958f-dc53ef9e96f3.jpg.jpg", "user_data/trip/luxemburg_28109239/luxembourg_258374319/photos/32da6769-06d2-452b-807e-ff8d6703fcf6_1536a0ea-28a3-4aea-9b6f-a3955e26cbcd.jpg.jpg", "user_data/trip/luxemburg_28109239/luxembourg_258374319/photos/ad21d49c-12cf-4062-9a2b-b215ceab3dca_3c09061b-3439-4a62-9e84-378345f9557c.jpg.jpg", "user_data/trip/luxemburg_28109239/luxembourg_258374319/photos/0645c59f-08b2-4872-a954-a3ba50b80a83_5f389a50-ba27-4e91-8850-8fde6eb6d979.jpg.jpg"],
      highlights: [],
      distanceKm: 0,
      days: 2,
    },
    {
      title: "Malaga",
      country: "",
      year: 2026,
      season: "",
      description: "",
      narrative: "",
      coverImage: "user_data/trip/malaga_24542529/torremolinos_228739891/photos/00943d53-cf86-4763-a736-95de5179049e_5d92b12e-8409-44ee-b1a4-b945a4edcb48.jpg.jpg",
      images: ["user_data/trip/malaga_24542529/eindhoven_229230637/photos/d02ddb85-37ac-44cf-b0f2-0ce4c0fc11a9_1c7bba06-1385-4c0c-bfc6-b6c3a792bd36.jpg.jpg"],
      highlights: [],
      distanceKm: 0,
      days: 7,
    },
    {
      title: "Paris",
      country: "",
      year: 2025,
      season: "",
      description: "",
      narrative: "",
      coverImage: "user_data/trip/paris_22829103/flushing_207681487/photos/c6c5f41d-8e6a-4187-86a5-c987462630ef_a8904e0d-73ca-462a-b082-fb149d384b8f.jpg.jpg",
      images: ["user_data/trip/paris_22829103/flushing_207681487/photos/034ba5cd-f11d-49cb-97a7-dd08b85e460d_3cce90a5-8996-4116-90e3-db6397a3b3cd.jpg.jpg", "user_data/trip/paris_22829103/paris_207702723/photos/84dedf66-7cdf-46dd-84bd-d2161e766eb7_f1570f39-88d9-4a5a-8152-2ef9b2b3c512.jpg.jpg", "user_data/trip/paris_22829103/paris_207702723/photos/3d642779-938b-4efb-952d-738151cb7a7a_b97613bb-162f-4f1a-a41a-7002048abbe2.jpg.jpg", "user_data/trip/paris_22829103/gonesse_207702190/photos/aef3fd36-5501-4aae-a6b8-d8a5c67c0555_91466ef0-1c01-469d-90d3-dd22ca2395a9.jpg.jpg", "user_data/trip/paris_22829103/gonesse_207702190/photos/4920fd22-3207-4b26-b320-bacdad3f247d_44c6fe83-4054-4a01-8c34-59bc2ab76b95.jpg.jpg", "user_data/trip/paris_22829103/paris_207718621/photos/75d8c7d1-b544-4406-8e52-93b1be1dceda_0505bd5f-3118-4fdb-b71c-98157b7456d2.jpg.jpg", "user_data/trip/paris_22829103/paris_207961669/photos/3d80a4ec-e683-4b13-be5e-d28dfaec9077_4a3804eb-55ba-4edd-a3d7-6fe88fd9d6a4.jpg.jpg"],
      highlights: [],
      distanceKm: 0,
      days: 3,
    },
    {
      title: "School at Sea 23/24",
      country: "",
      year: 2023,
      season: "",
      description: "Half jaar zeilen over de atlantische oceaan",
      narrative: "Half jaar zeilen over de atlantische oceaan",
      coverImage: "user_data/trip/school-at-sea-23-24_8314064/santa-cruz-de-tenerife_84927152/photos/93B2A23C-79C7-4D06-BEB1-87265A8EAF77_908EB2C3-29BF-42C2-80AA-49E4928BA7F7.jpg.jpg",
      images: ["user_data/trip/school-at-sea-23-24_8314064/sudwest-fryslan_81271220/photos/4F841D90-E982-44EC-A50A-578064B604C5_AE718379-1541-49F2-895C-B21BAE2431B5.jpg.jpg", "user_data/trip/school-at-sea-23-24_8314064/sudwest-fryslan_81271220/photos/5E6C377E-FDF3-432F-AA0F-1C64ABC5336F_96AA11FF-4CA3-4169-A702-4D81390C8B44.jpg.jpg", "user_data/trip/school-at-sea-23-24_8314064/harlingen_82625101/photos/CBB50472-78E6-4528-AF57-37F6B9BB693C_40EADBF3-8F2E-4CF4-B439-7E12860469BC.jpg.jpg", "user_data/trip/school-at-sea-23-24_8314064/harlingen_82625101/photos/A1300FD8-D145-495E-BA5B-CC497C04EA67_130D8B9B-C703-41F9-9594-550390E774B5.jpg.jpg", "user_data/trip/school-at-sea-23-24_8314064/harlingen_82625101/photos/1274BFB4-7E3B-4675-93FA-ABE9BB630A84_4F8F6116-0AAA-4274-87E6-E8FFE80730F7.jpg.jpg", "user_data/trip/school-at-sea-23-24_8314064/harlingen_82625101/photos/F1181D63-4213-4DEB-BE2B-8451FE003C4F_91F6C852-883F-436F-BDB5-B2E259432A44.jpg.jpg", "user_data/trip/school-at-sea-23-24_8314064/harlingen_82625101/photos/5BF1B5F6-F3FE-4D08-B180-64933981C4F5_08A4AFD3-6CDC-4EC6-8410-A9A6FB1EEB93.jpg.jpg"],
      highlights: [],
      distanceKm: 0,
      days: 13,
    },
    {
      title: "Thailand 🇹🇭",
      country: "",
      year: 2018,
      season: "",
      description: "🇹🇭",
      narrative: "🇹🇭",
      coverImage: "user_data/trip/thailand_22606764/bangkok_202771930/photos/a682df30-67f0-4099-8000-56319516fd7f_6025da7b-d786-4d63-b84b-935eb49bd9ba.jpg.jpg",
      images: [],
      highlights: [],
      distanceKm: 0,
      days: 22,
    },
    {
      title: "Stukje wandelen",
      country: "",
      year: 2026,
      season: "",
      description: "",
      narrative: "",
      coverImage: "user_data/trip/tour-du-mont-blanc_26258148/chamonix-mont-blanc_241182554/photos/7629c77d-bfc8-48d4-a619-a45ccc40a3cc_c6936342-8c1c-4635-b8d6-0660ec0575ec.jpg.jpg",
      images: ["user_data/trip/tour-du-mont-blanc_26258148/chamonix-mont-blanc_241182554/photos/e73efcf5-4839-4652-8eb5-d36eb259bed2_5aa227a6-22f8-4993-a2a7-b7d243b98241.jpg.jpg", "user_data/trip/tour-du-mont-blanc_26258148/chamonix-mont-blanc_241182554/photos/a4aa7ff4-3911-4c81-be65-7d6a5b43f73c_04cf451f-6a90-43f8-8aca-c0ab27aaa932.jpg.jpg", "user_data/trip/tour-du-mont-blanc_26258148/chamonix-mont-blanc_241182554/photos/4e3cc506-b3ce-4478-b862-594fdb29c8f7_a6d8445f-4562-4b17-be6e-ed3e856158e8.jpg.jpg", "user_data/trip/tour-du-mont-blanc_26258148/chamonix-mont-blanc_241182554/photos/fa205c70-3b8d-42f3-830d-f17a76703477_3f964a7f-9da4-48d4-ac25-24dceb8cbd30.jpg.jpg", "user_data/trip/tour-du-mont-blanc_26258148/chamonix-mont-blanc_241182554/photos/24cf5d37-a3cd-4ffe-9a0d-532b4971766e_f8bb1978-252b-4795-a492-e32299483209.jpg.jpg", "user_data/trip/tour-du-mont-blanc_26258148/chamonix-mont-blanc_241182554/photos/b557a29c-5797-4f4a-8c6f-8d50239c6616_96f5caac-2ccf-4372-81be-d1de2e1e0c72.jpg.jpg", "user_data/trip/tour-du-mont-blanc_26258148/chamonix-mont-blanc_241182554/photos/9788f4d3-11b7-4431-b2d0-0ee9b7cc162e_917cd20f-ca76-4a48-bc86-f7ff2b0f3d1d.jpg.jpg"],
      highlights: [],
      distanceKm: 0,
      days: 4,
    },
    {
      title: "2 Weekjes varen op de Willem Jacob",
      country: "",
      year: 2023,
      season: "",
      description: "2 Weekjes helpen op de Willem Jacob",
      narrative: "2 Weekjes helpen op de Willem Jacob",
      coverImage: "user_data/trip/weekje-varen-op-de-willem-jacob_8317813/ameland_72542827/photos/50C0AE54-E10C-4BFD-868B-975EDEF3C3BC_351F8972-62A1-4ECF-9978-27D9C987B0A6.jpg.jpg",
      images: ["user_data/trip/weekje-varen-op-de-willem-jacob_8317813/ameland_72542827/photos/DFAEF693-DE8C-4E49-9321-5A74D647E64D_5D1BB280-20C1-4592-A9D0-648BA88B698D.jpg.jpg", "user_data/trip/weekje-varen-op-de-willem-jacob_8317813/ameland_72542827/photos/12AC0F2A-93E9-40B6-A75D-7AED89C43B01_A8F67AE3-70E7-409C-A26C-F62284ED197A.jpg.jpg", "user_data/trip/weekje-varen-op-de-willem-jacob_8317813/ameland_72542827/photos/34AE29BA-ADD8-40AD-8A8B-6102A7AC2665_DFBEBE8F-9B04-4E21-98F3-E8567AA4F957.jpg.jpg", "user_data/trip/weekje-varen-op-de-willem-jacob_8317813/ameland_72542827/photos/19B26F70-755F-4712-9B74-C74AEBE5BEDD_0B6A2186-B77E-44EB-8D41-C4AF190DEFCA.jpg.jpg", "user_data/trip/weekje-varen-op-de-willem-jacob_8317813/ameland_72542827/photos/AACAF99F-9CA3-447E-9265-DDAEB227537F_279F07F2-085E-4D08-A74F-EF7F2C02B7F2.jpg.jpg", "user_data/trip/weekje-varen-op-de-willem-jacob_8317813/ameland_72542827/photos/AE8DC622-746F-436A-92A4-A6E296F04840_AAF8F22D-0CBD-4479-9D21-AEB88B278FAA.jpg.jpg", "user_data/trip/weekje-varen-op-de-willem-jacob_8317813/ameland_72542827/photos/0232E212-BAA1-4721-9468-7D169D2EAC1A_01904AB2-35B2-48B9-B8DF-565BB9358EDA.jpg.jpg"],
      highlights: [],
      distanceKm: 0,
      days: 21,
    },
    {
      title: "Zeilreis sailhero",
      country: "",
      year: 2024,
      season: "",
      description: "10 daagjes lekker varen",
      narrative: "10 daagjes lekker varen",
      coverImage: "user_data/trip/zeilreis-sailhero_11087697/assens_105981299/photos/EEDEA8ED-3987-451E-8BA0-F600E02E4D75_A33E2200-24AB-4DEB-A908-25D62A3BA183.jpg.jpg",
      images: ["user_data/trip/zeilreis-sailhero_11087697/assens_105981299/photos/6CA9045B-A01D-4315-B7A5-70D36222027A_A9541909-5088-4128-AD8C-ABF8625CEEFF.jpg.jpg", "user_data/trip/zeilreis-sailhero_11087697/assens_105981299/photos/62F22A06-B581-41D0-BEA7-9ADDE6545EAC_D561DACE-9553-46E5-AAE8-E4834118CAB6.jpg.jpg", "user_data/trip/zeilreis-sailhero_11087697/assens_105981299/photos/D361A70B-9B31-4C4E-A54B-CE86A484B12A_A29BEBC7-F1A5-4A5F-A13F-A2A84F56325C.jpg.jpg", "user_data/trip/zeilreis-sailhero_11087697/assens_105981299/photos/29E5F8B7-67BE-488C-8ACD-DC8A58FA7E47_4551D90C-9882-42E6-B012-CDD655E32547.jpg.jpg", "user_data/trip/zeilreis-sailhero_11087697/assens_105981299/photos/7D29E540-CDCD-49ED-A9BE-B17071F8CF06_159C77DE-C2F8-4247-AC6A-A0C2F3864459.jpg.jpg", "user_data/trip/zeilreis-sailhero_11087697/assens_105981299/photos/09957B49-035F-4B1A-849C-3C7E62C085C2_118035B2-C5BC-4B66-8E69-6BCD1D9C1B99.jpg.jpg", "user_data/trip/zeilreis-sailhero_11087697/assens_105981299/photos/DBD5789A-CD22-4228-A51F-00C5E5528687_8919A464-0746-4205-BBB7-D5FBDBCEB350.jpg.jpg"],
      highlights: [],
      distanceKm: 0,
      days: 10,
    },
    /* --- POLARSTEPS SYNC END --- */

    // Add any trips not on Polarsteps below this line — they won't be touched by the import script.
  ],

  /* ----------------------------------------------------------
     3. HIKES
     Auto-filled by update_hikes.py — see README.md.
     Format for manual additions:
     {
       name: "Trail name",
       date: "YYYY-MM-DD",
       distanceKm: 16.2,
       elevationUp: 1240,
       elevationDown: 1090,
       durationMin: 258,
       country: "France",
       url: "https://www.komoot.com/tour/xxxxx"
     }
  ---------------------------------------------------------- */
  hikes: [
    /* --- KOMOOT SYNC START (do not edit this block by hand — it gets overwritten by update_hikes.py) --- */
    {
      name: "Tour du Mont Blanc — normale route",
      date: "2026-06-15",
      distanceKm: 16.2,
      elevationUp: 1240,
      elevationDown: 1090,
      durationMin: 258,
      country: "France",
      url: "https://www.komoot.com/nl-nl/tour/3099718448",
    },
    /* --- KOMOOT SYNC END --- */

    // Add any hikes not on Komoot below this line — they won't be touched by the sync script.
  ],

};
