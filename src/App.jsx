import { useState, useEffect, useRef } from "react";
import {
  MultiFormatReader, BarcodeFormat, DecodeHintType,
  RGBLuminanceSource, BinaryBitmap, HybridBinarizer,
} from "@zxing/library";

const K = { USER:"tz_user",LOG:"tz_log",GOALS:"tz_goals",STEPS:"tz_steps",WP:"tz_wp",WL:"tz_wl",FAVS:"tz_favs" };

// ─── Organic Nature Palette ───────────────────────────────────────────────────
const C = {
  bg:"#f5f0e8",           // warm cream
  bg2:"#ede8dc",          // darker cream
  surface:"#faf8f2",      // light cream
  card:"#faf8f2",
  cardGlass:"rgba(250,248,242,0.85)",
  border:"#d4c9a8",
  borderStrong:"#b8a878",
  // Greens
  leaf:"#4a7c59",         // deep leaf green
  leaf2:"#3d6b4a",
  leafSoft:"#e8f0e9",
  sage:"#7a9e7e",         // sage
  sageSoft:"#eef4ee",
  moss:"#5c7a4e",         // moss green
  // Warm accents
  azalea:"#c9607a",       // azalea pink
  azaleaSoft:"#f8e8ed",
  smokeOrange:"#d4784a",  // smoke orange
  smokeSoft:"#faeee6",
  dandelion:"#c9a227",    // flowering dandelion
  dandelionSoft:"#faf2db",
  // Text
  text:"#2c2416",         // dark warm brown
  textSec:"#5c4f38",
  muted:"#8c7d65",
  dim:"#c4b89a",
  // Shadows
  shadow:"0 2px 16px rgba(74,124,89,0.10)",
  shadowMd:"0 6px 28px rgba(74,124,89,0.15)",
  shadowLg:"0 12px 40px rgba(44,36,22,0.12)",
};

// ─── Extended Food DB (150+ items) ───────────────────────────────────────────
const FOOD_DB = [
  // Geflügel
  {name:"Hühnchenbrust (gegrillt)",calories:165,protein:31,carbs:0,fat:3.6,emoji:"🍗",cat:"Fleisch"},
  {name:"Hühnchenbrust (roh)",calories:120,protein:22,carbs:0,fat:2.6,emoji:"🍗",cat:"Fleisch"},
  {name:"Hähnchenschenkel",calories:209,protein:26,carbs:0,fat:11,emoji:"🍗",cat:"Fleisch"},
  {name:"Hühnchen (allgemein)",calories:239,protein:27,carbs:0,fat:14,emoji:"🍗",cat:"Fleisch"},
  {name:"Putenbrust",calories:135,protein:29,carbs:0,fat:1.5,emoji:"🦃",cat:"Fleisch"},
  {name:"Putengeschnetzeltes",calories:157,protein:24,carbs:0,fat:6,emoji:"🦃",cat:"Fleisch"},
  // Rind & Schwein
  {name:"Rindfleisch (mager)",calories:217,protein:26,carbs:0,fat:12,emoji:"🥩",cat:"Fleisch"},
  {name:"Rinderhackfleisch (20% Fett)",calories:254,protein:17,carbs:0,fat:20,emoji:"🥩",cat:"Fleisch"},
  {name:"Rindersteak",calories:271,protein:26,carbs:0,fat:18,emoji:"🥩",cat:"Fleisch"},
  {name:"Schweinefleisch (mager)",calories:242,protein:27,carbs:0,fat:14,emoji:"🥩",cat:"Fleisch"},
  {name:"Schweinefilet",calories:143,protein:22,carbs:0,fat:5,emoji:"🥩",cat:"Fleisch"},
  {name:"Schinken (mager)",calories:145,protein:22,carbs:1.5,fat:5.5,emoji:"🥩",cat:"Fleisch"},
  {name:"Speck",calories:458,protein:12,carbs:0,fat:45,emoji:"🥓",cat:"Fleisch"},
  // Fisch & Meeresfrüchte
  {name:"Lachs",calories:208,protein:20,carbs:0,fat:13,emoji:"🐟",cat:"Fisch"},
  {name:"Thunfisch (Dose)",calories:116,protein:26,carbs:0,fat:1,emoji:"🐟",cat:"Fisch"},
  {name:"Thunfisch (frisch)",calories:144,protein:23,carbs:0,fat:5,emoji:"🐟",cat:"Fisch"},
  {name:"Kabeljau",calories:82,protein:18,carbs:0,fat:0.7,emoji:"🐟",cat:"Fisch"},
  {name:"Forelle",calories:141,protein:20,carbs:0,fat:6,emoji:"🐟",cat:"Fisch"},
  {name:"Garnelen",calories:99,protein:24,carbs:0,fat:0.3,emoji:"🦐",cat:"Fisch"},
  {name:"Sardinen (Dose)",calories:208,protein:25,carbs:0,fat:11,emoji:"🐟",cat:"Fisch"},
  // Eier & Milchprodukte
  {name:"Eier (Vollei)",calories:155,protein:13,carbs:1.1,fat:11,emoji:"🥚",cat:"Milch & Eier"},
  {name:"Eiweiß",calories:52,protein:11,carbs:0.7,fat:0.2,emoji:"🥚",cat:"Milch & Eier"},
  {name:"Eigelb",calories:322,protein:16,carbs:3.6,fat:27,emoji:"🥚",cat:"Milch & Eier"},
  {name:"Milch (3,5%)",calories:61,protein:3.4,carbs:4.8,fat:3.5,emoji:"🥛",cat:"Milch & Eier"},
  {name:"Milch (1,5%)",calories:46,protein:3.4,carbs:4.8,fat:1.5,emoji:"🥛",cat:"Milch & Eier"},
  {name:"Haferdrink",calories:45,protein:1,carbs:6.6,fat:1.5,emoji:"🥛",cat:"Milch & Eier"},
  {name:"Mandeldrink",calories:24,protein:0.5,carbs:2.5,fat:1.3,emoji:"🥛",cat:"Milch & Eier"},
  {name:"Sojadrink",calories:33,protein:3.3,carbs:1.8,fat:1.8,emoji:"🥛",cat:"Milch & Eier"},
  {name:"Joghurt (griechisch, 10%)",calories:97,protein:9,carbs:3.6,fat:5,emoji:"🥛",cat:"Milch & Eier"},
  {name:"Joghurt (3,5%)",calories:64,protein:3.8,carbs:4.6,fat:3.5,emoji:"🥛",cat:"Milch & Eier"},
  {name:"Joghurt (fettarm)",calories:47,protein:4.1,carbs:6.5,fat:0.2,emoji:"🥛",cat:"Milch & Eier"},
  {name:"Quark (Magerquark)",calories:67,protein:12,carbs:3.7,fat:0.2,emoji:"🥛",cat:"Milch & Eier"},
  {name:"Quark (20%)",calories:116,protein:10,carbs:3.7,fat:7,emoji:"🥛",cat:"Milch & Eier"},
  {name:"Skyr",calories:63,protein:11,carbs:4,fat:0.2,emoji:"🥛",cat:"Milch & Eier"},
  {name:"Hüttenkäse",calories:98,protein:11,carbs:3.4,fat:4.3,emoji:"🧀",cat:"Milch & Eier"},
  {name:"Mozzarella",calories:280,protein:28,carbs:2.2,fat:17,emoji:"🧀",cat:"Milch & Eier"},
  {name:"Käse (Gouda)",calories:356,protein:25,carbs:2.2,fat:27,emoji:"🧀",cat:"Milch & Eier"},
  {name:"Käse (Emmentaler)",calories:380,protein:29,carbs:0,fat:29,emoji:"🧀",cat:"Milch & Eier"},
  {name:"Frischkäse",calories:342,protein:7.5,carbs:4.1,fat:33,emoji:"🧀",cat:"Milch & Eier"},
  {name:"Ricotta",calories:174,protein:11,carbs:3,fat:13,emoji:"🧀",cat:"Milch & Eier"},
  {name:"Parmesan",calories:431,protein:38,carbs:0,fat:29,emoji:"🧀",cat:"Milch & Eier"},
  {name:"Butter",calories:717,protein:0.9,carbs:0.1,fat:81,emoji:"🧈",cat:"Milch & Eier"},
  {name:"Sahne (30%)",calories:285,protein:2.3,carbs:3.3,fat:30,emoji:"🥛",cat:"Milch & Eier"},
  {name:"Crème fraîche",calories:292,protein:2.4,carbs:2.7,fat:30,emoji:"🥛",cat:"Milch & Eier"},
  // Getreide & Brot
  {name:"Reis (gekocht)",calories:130,protein:2.7,carbs:28,fat:0.3,emoji:"🍚",cat:"Getreide"},
  {name:"Reis (roh)",calories:350,protein:7,carbs:77,fat:0.7,emoji:"🍚",cat:"Getreide"},
  {name:"Basmati-Reis (gekocht)",calories:121,protein:2.5,carbs:26,fat:0.3,emoji:"🍚",cat:"Getreide"},
  {name:"Nudeln (gekocht)",calories:131,protein:5,carbs:25,fat:1.1,emoji:"🍝",cat:"Getreide"},
  {name:"Nudeln (roh)",calories:371,protein:13,carbs:74,fat:1.5,emoji:"🍝",cat:"Getreide"},
  {name:"Vollkornnudeln (gekocht)",calories:124,protein:5.3,carbs:23,fat:0.9,emoji:"🍝",cat:"Getreide"},
  {name:"Haferflocken",calories:389,protein:17,carbs:66,fat:7,emoji:"🥣",cat:"Getreide"},
  {name:"Müsli (ohne Zucker)",calories:364,protein:11,carbs:60,fat:7,emoji:"🥣",cat:"Getreide"},
  {name:"Brot (Vollkorn)",calories:247,protein:13,carbs:41,fat:3.4,emoji:"🍞",cat:"Getreide"},
  {name:"Toastbrot",calories:265,protein:8,carbs:49,fat:3.4,emoji:"🍞",cat:"Getreide"},
  {name:"Brot (Weizen)",calories:266,protein:9,carbs:49,fat:3.2,emoji:"🍞",cat:"Getreide"},
  {name:"Laugenbrezel",calories:262,protein:9,carbs:50,fat:2,emoji:"🥨",cat:"Getreide"},
  {name:"Croissant",calories:406,protein:8,carbs:46,fat:21,emoji:"🥐",cat:"Getreide"},
  {name:"Bagel",calories:250,protein:10,carbs:49,fat:1.5,emoji:"🥯",cat:"Getreide"},
  {name:"Tortilla-Wrap",calories:218,protein:6,carbs:38,fat:5,emoji:"🫓",cat:"Getreide"},
  {name:"Quinoa (gekocht)",calories:120,protein:4.4,carbs:21,fat:1.9,emoji:"🌾",cat:"Getreide"},
  {name:"Couscous (gekocht)",calories:112,protein:3.8,carbs:23,fat:0.2,emoji:"🌾",cat:"Getreide"},
  {name:"Bulgur (gekocht)",calories:83,protein:3.1,carbs:18,fat:0.2,emoji:"🌾",cat:"Getreide"},
  // Kartoffeln
  {name:"Kartoffeln (gekocht)",calories:77,protein:2,carbs:17,fat:0.1,emoji:"🥔",cat:"Gemüse"},
  {name:"Süßkartoffel",calories:86,protein:1.6,carbs:20,fat:0.1,emoji:"🍠",cat:"Gemüse"},
  {name:"Pommes frites",calories:312,protein:3.4,carbs:41,fat:15,emoji:"🍟",cat:"Gemüse"},
  // Gemüse
  {name:"Brokkoli",calories:34,protein:2.8,carbs:7,fat:0.4,emoji:"🥦",cat:"Gemüse"},
  {name:"Spinat",calories:23,protein:2.9,carbs:3.6,fat:0.4,emoji:"🥬",cat:"Gemüse"},
  {name:"Tomaten",calories:18,protein:0.9,carbs:3.9,fat:0.2,emoji:"🍅",cat:"Gemüse"},
  {name:"Cherrytomaten",calories:18,protein:0.9,carbs:3.9,fat:0.2,emoji:"🍅",cat:"Gemüse"},
  {name:"Gurke",calories:16,protein:0.7,carbs:3.1,fat:0.1,emoji:"🥒",cat:"Gemüse"},
  {name:"Karotten",calories:41,protein:0.9,carbs:10,fat:0.2,emoji:"🥕",cat:"Gemüse"},
  {name:"Paprika (rot)",calories:31,protein:1,carbs:6,fat:0.3,emoji:"🫑",cat:"Gemüse"},
  {name:"Paprika (gelb)",calories:27,protein:1,carbs:5.3,fat:0.2,emoji:"🫑",cat:"Gemüse"},
  {name:"Zucchini",calories:17,protein:1.2,carbs:3.1,fat:0.3,emoji:"🥬",cat:"Gemüse"},
  {name:"Aubergine",calories:25,protein:1,carbs:5.7,fat:0.2,emoji:"🍆",cat:"Gemüse"},
  {name:"Blumenkohl",calories:25,protein:1.9,carbs:5,fat:0.3,emoji:"🥦",cat:"Gemüse"},
  {name:"Champignons",calories:22,protein:3.1,carbs:3.3,fat:0.5,emoji:"🍄",cat:"Gemüse"},
  {name:"Mais (Dose)",calories:82,protein:2.7,carbs:15,fat:1.2,emoji:"🌽",cat:"Gemüse"},
  {name:"Erbsen",calories:81,protein:5.4,carbs:14,fat:0.4,emoji:"🫛",cat:"Gemüse"},
  {name:"Edamame",calories:122,protein:11,carbs:10,fat:5,emoji:"🫘",cat:"Gemüse"},
  {name:"Rucola",calories:25,protein:2.6,carbs:3.6,fat:0.7,emoji:"🥬",cat:"Gemüse"},
  {name:"Eisbergsalat",calories:14,protein:0.9,carbs:2.9,fat:0.1,emoji:"🥗",cat:"Gemüse"},
  {name:"Zwiebeln",calories:40,protein:1.1,carbs:9.3,fat:0.1,emoji:"🧅",cat:"Gemüse"},
  {name:"Knoblauch",calories:149,protein:6.4,carbs:33,fat:0.5,emoji:"🧄",cat:"Gemüse"},
  // Obst
  {name:"Banane",calories:89,protein:1.1,carbs:23,fat:0.3,emoji:"🍌",cat:"Obst"},
  {name:"Apfel",calories:52,protein:0.3,carbs:14,fat:0.2,emoji:"🍎",cat:"Obst"},
  {name:"Birne",calories:57,protein:0.4,carbs:15,fat:0.1,emoji:"🍐",cat:"Obst"},
  {name:"Orange",calories:47,protein:0.9,carbs:12,fat:0.1,emoji:"🍊",cat:"Obst"},
  {name:"Erdbeeren",calories:32,protein:0.7,carbs:7.7,fat:0.3,emoji:"🍓",cat:"Obst"},
  {name:"Blaubeeren",calories:57,protein:0.7,carbs:14,fat:0.3,emoji:"🫐",cat:"Obst"},
  {name:"Himbeeren",calories:52,protein:1.2,carbs:12,fat:0.7,emoji:"🫐",cat:"Obst"},
  {name:"Mango",calories:60,protein:0.8,carbs:15,fat:0.4,emoji:"🥭",cat:"Obst"},
  {name:"Ananas",calories:50,protein:0.5,carbs:13,fat:0.1,emoji:"🍍",cat:"Obst"},
  {name:"Trauben",calories:69,protein:0.7,carbs:18,fat:0.2,emoji:"🍇",cat:"Obst"},
  {name:"Kiwi",calories:61,protein:1.1,carbs:15,fat:0.5,emoji:"🥝",cat:"Obst"},
  {name:"Wassermelone",calories:30,protein:0.6,carbs:7.6,fat:0.2,emoji:"🍉",cat:"Obst"},
  {name:"Avocado",calories:160,protein:2,carbs:9,fat:15,emoji:"🥑",cat:"Obst"},
  {name:"Grapefruit",calories:42,protein:0.8,carbs:11,fat:0.1,emoji:"🍊",cat:"Obst"},
  // Nüsse & Samen
  {name:"Mandeln",calories:579,protein:21,carbs:22,fat:50,emoji:"🥜",cat:"Nüsse"},
  {name:"Walnüsse",calories:654,protein:15,carbs:14,fat:65,emoji:"🌰",cat:"Nüsse"},
  {name:"Cashews",calories:553,protein:18,carbs:30,fat:44,emoji:"🥜",cat:"Nüsse"},
  {name:"Erdnüsse",calories:567,protein:26,carbs:16,fat:49,emoji:"🥜",cat:"Nüsse"},
  {name:"Erdnussbutter",calories:588,protein:25,carbs:20,fat:50,emoji:"🥜",cat:"Nüsse"},
  {name:"Mandelmus",calories:614,protein:21,carbs:19,fat:56,emoji:"🥜",cat:"Nüsse"},
  {name:"Chiasamen",calories:486,protein:17,carbs:42,fat:31,emoji:"🌱",cat:"Nüsse"},
  {name:"Leinsamen",calories:534,protein:18,carbs:29,fat:42,emoji:"🌱",cat:"Nüsse"},
  {name:"Kürbiskerne",calories:559,protein:30,carbs:11,fat:49,emoji:"🌱",cat:"Nüsse"},
  {name:"Sonnenblumenkerne",calories:584,protein:21,carbs:20,fat:51,emoji:"🌱",cat:"Nüsse"},
  // Hülsenfrüchte
  {name:"Linsen (gekocht)",calories:116,protein:9,carbs:20,fat:0.4,emoji:"🫘",cat:"Hülsenfrüchte"},
  {name:"Kichererbsen (gekocht)",calories:164,protein:8.9,carbs:27,fat:2.6,emoji:"🫘",cat:"Hülsenfrüchte"},
  {name:"Schwarze Bohnen",calories:132,protein:8.9,carbs:24,fat:0.5,emoji:"🫘",cat:"Hülsenfrüchte"},
  {name:"Kidneybohnen",calories:127,protein:8.7,carbs:23,fat:0.5,emoji:"🫘",cat:"Hülsenfrüchte"},
  {name:"Tofu (natur)",calories:76,protein:8,carbs:1.9,fat:4.8,emoji:"🟨",cat:"Hülsenfrüchte"},
  {name:"Tempeh",calories:193,protein:19,carbs:9,fat:11,emoji:"🟫",cat:"Hülsenfrüchte"},
  // Fette & Öle
  {name:"Olivenöl",calories:884,protein:0,carbs:0,fat:100,emoji:"🫙",cat:"Fette"},
  {name:"Kokosöl",calories:892,protein:0,carbs:0,fat:100,emoji:"🫙",cat:"Fette"},
  {name:"Rapsöl",calories:884,protein:0,carbs:0,fat:100,emoji:"🫙",cat:"Fette"},
  {name:"Mayonnaise",calories:680,protein:1,carbs:2.5,fat:74,emoji:"🫙",cat:"Fette"},
  // Protein & Supplements
  {name:"Protein-Pulver (Whey)",calories:380,protein:75,carbs:10,fat:5,emoji:"💪",cat:"Supplements"},
  {name:"Protein-Pulver (Vegan)",calories:360,protein:70,carbs:8,fat:6,emoji:"💪",cat:"Supplements"},
  {name:"Casein-Protein",calories:370,protein:76,carbs:6,fat:4,emoji:"💪",cat:"Supplements"},
  {name:"BCAA",calories:50,protein:10,carbs:0,fat:0,emoji:"💊",cat:"Supplements"},
  {name:"Kreatin",calories:0,protein:0,carbs:0,fat:0,emoji:"💊",cat:"Supplements"},
  // Kaffeespezialitäten (wichtig!)
  {name:"Espresso",calories:2,protein:0.2,carbs:0.4,fat:0.1,emoji:"☕",cat:"Getränke"},
  {name:"Americano",calories:5,protein:0.3,carbs:0.5,fat:0.1,emoji:"☕",cat:"Getränke"},
  {name:"Cappuccino",calories:74,protein:4,carbs:7,fat:3,emoji:"☕",cat:"Getränke"},
  {name:"Cappuccino (Hafermilch)",calories:88,protein:2.5,carbs:11,fat:3,emoji:"☕",cat:"Getränke"},
  {name:"Latte Macchiato",calories:120,protein:6,carbs:12,fat:4.5,emoji:"☕",cat:"Getränke"},
  {name:"Latte Macchiato (Hafermilch)",calories:110,protein:3,carbs:16,fat:3.5,emoji:"☕",cat:"Getränke"},
  {name:"Flat White",calories:100,protein:5.5,carbs:9,fat:4,emoji:"☕",cat:"Getränke"},
  {name:"Flat White (Hafermilch)",calories:95,protein:2.5,carbs:13,fat:3.5,emoji:"☕",cat:"Getränke"},
  {name:"Café au Lait",calories:60,protein:3.2,carbs:5,fat:2.5,emoji:"☕",cat:"Getränke"},
  {name:"Kaffee (schwarz)",calories:2,protein:0.3,carbs:0,fat:0,emoji:"☕",cat:"Getränke"},
  {name:"Tee (ungesüßt)",calories:1,protein:0,carbs:0.3,fat:0,emoji:"🍵",cat:"Getränke"},
  {name:"Orangensaft (frisch)",calories:45,protein:0.7,carbs:10,fat:0.2,emoji:"🍊",cat:"Getränke"},
  {name:"Apfelsaft",calories:46,protein:0.1,carbs:11,fat:0.1,emoji:"🍏",cat:"Getränke"},
  {name:"Cola",calories:42,protein:0,carbs:11,fat:0,emoji:"🥤",cat:"Getränke"},
  {name:"Cola Zero",calories:0,protein:0,carbs:0,fat:0,emoji:"🥤",cat:"Getränke"},
  {name:"Bier (0,5L)",calories:215,protein:1.5,carbs:16,fat:0,emoji:"🍺",cat:"Getränke"},
  {name:"Wein (Glas, 150ml)",calories:129,protein:0.1,carbs:3.8,fat:0,emoji:"🍷",cat:"Getränke"},
  // Snacks & Süßes
  {name:"Schokolade (Zartbitter)",calories:546,protein:5,carbs:60,fat:31,emoji:"🍫",cat:"Snacks"},
  {name:"Schokolade (Vollmilch)",calories:535,protein:7.7,carbs:57,fat:30,emoji:"🍫",cat:"Snacks"},
  {name:"Chips",calories:536,protein:7,carbs:51,fat:33,emoji:"🥔",cat:"Snacks"},
  {name:"Gummibärchen",calories:340,protein:6.4,carbs:77,fat:0.1,emoji:"🍬",cat:"Snacks"},
  {name:"Keks (Butterkeks)",calories:483,protein:7,carbs:71,fat:17,emoji:"🍪",cat:"Snacks"},
  {name:"Protein-Riegel",calories:360,protein:30,carbs:38,fat:8,emoji:"🍫",cat:"Snacks"},
  {name:"Müsliriegel",calories:420,protein:7,carbs:60,fat:16,emoji:"🍫",cat:"Snacks"},
  {name:"Nuss-Nougat-Creme",calories:547,protein:6.3,carbs:57,fat:33,emoji:"🫙",cat:"Snacks"},
  // Fertige Gerichte & Fast Food
  {name:"Pizza Margherita (Stück)",calories:267,protein:11,carbs:33,fat:9,emoji:"🍕",cat:"Fertiggerichte"},
  {name:"Burger (klassisch)",calories:295,protein:17,carbs:24,fat:13,emoji:"🍔",cat:"Fertiggerichte"},
  {name:"Döner (mit Fleisch)",calories:280,protein:18,carbs:28,fat:10,emoji:"🌯",cat:"Fertiggerichte"},
  {name:"Sushi Nigiri (Stück)",calories:40,protein:2,carbs:7,fat:0.3,emoji:"🍣",cat:"Fertiggerichte"},
  {name:"Sushi Maki (Stück)",calories:30,protein:1.2,carbs:5.8,fat:0.2,emoji:"🍣",cat:"Fertiggerichte"},
  {name:"Wrap (Chicken)",calories:280,protein:22,carbs:30,fat:8,emoji:"🌯",cat:"Fertiggerichte"},
  {name:"Salat (Caesar)",calories:170,protein:8,carbs:12,fat:10,emoji:"🥗",cat:"Fertiggerichte"},
  // Saucen & Dressings
  {name:"Ketchup",calories:101,protein:1.3,carbs:24,fat:0.1,emoji:"🍅",cat:"Saucen"},
  {name:"Senf",calories:60,protein:4,carbs:6,fat:2,emoji:"🌭",cat:"Saucen"},
  {name:"Sojasauce",calories:60,protein:5.5,carbs:8,fat:0,emoji:"🫙",cat:"Saucen"},
  {name:"Tabasco",calories:12,protein:0.5,carbs:2,fat:0.5,emoji:"🌶️",cat:"Saucen"},
  {name:"Caesar Dressing",calories:310,protein:2,carbs:7,fat:30,emoji:"🫙",cat:"Saucen"},
  {name:"Balsamico",calories:88,protein:0.5,carbs:17,fat:0,emoji:"🫙",cat:"Saucen"},
  {name:"Hummus",calories:177,protein:8,carbs:20,fat:9,emoji:"🫘",cat:"Saucen"},
];

const MEAL_TYPES=[
  {id:"breakfast",label:"Frühstück",emoji:"☀️"},
  {id:"lunch",label:"Mittagessen",emoji:"🌿"},
  {id:"dinner",label:"Abendessen",emoji:"🌙"},
  {id:"snack",label:"Snack",emoji:"🍃"},
];

function calcTDEE(u){if(!u.weight||!u.height||!u.age)return null;let bmr=u.gender==="male"?10*u.weight+6.25*u.height-5*u.age+5:10*u.weight+6.25*u.height-5*u.age-161;const m={sedentary:1.2,light:1.375,moderate:1.55,active:1.725,veryActive:1.9};let t=bmr*(m[u.activity]||1.55);if(u.goal==="lose")t-=500;else if(u.goal==="gain")t+=300;return Math.round(t);}
function calcProt(u){if(!u?.weight)return 150;return u.goal==="gain"?Math.round(u.weight*2.2):u.goal==="lose"?Math.round(u.weight*2):Math.round(u.weight*1.8);}
function todayKey(){return new Date().toDateString();}
function dateKey(d){return d.toDateString();}
function ls(k,fb){try{const v=localStorage.getItem(k);return v?JSON.parse(v):fb;}catch{return fb;}}
function lsSet(k,v){localStorage.setItem(k,JSON.stringify(v));}
function searchFoods(q){if(!q||q.length<2)return[];const lq=q.toLowerCase();return FOOD_DB.filter(f=>f.name.toLowerCase().includes(lq)).slice(0,8);}

// Haptic feedback helper
function haptic(type="light"){try{if(navigator.vibrate){if(type==="light")navigator.vibrate(8);else if(type==="medium")navigator.vibrate(20);else navigator.vibrate([10,5,10]);}}catch{}}

const sInput=(extra={})=>({width:"100%",background:C.surface,border:`1.5px solid ${C.border}`,borderRadius:14,padding:"13px 16px",color:C.text,fontSize:16,WebkitAppearance:"none",fontFamily:"inherit",transition:"border-color .2s",...extra});
const sCard=(extra={})=>({background:C.card,borderRadius:20,padding:"16px 18px",border:`1px solid ${C.border}`,boxShadow:C.shadow,...extra});

// ── TZ Monogram Icon (SVG) ────────────────────────────────────────────────────
function TZIcon({size=48}){
  return(
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Leaf background */}
      <defs>
        <radialGradient id="bgGrad" cx="40%" cy="40%" r="65%">
          <stop offset="0%" stopColor="#5c8f5a"/>
          <stop offset="100%" stopColor="#2d5a30"/>
        </radialGradient>
      </defs>
      <rect width="100" height="100" rx="22" fill="url(#bgGrad)"/>
      {/* Decorative leaves */}
      <ellipse cx="78" cy="22" rx="18" ry="9" fill="#4a7c59" opacity="0.5" transform="rotate(-35 78 22)"/>
      <ellipse cx="20" cy="80" rx="16" ry="8" fill="#3d6b4a" opacity="0.4" transform="rotate(30 20 80)"/>
      <ellipse cx="82" cy="72" rx="12" ry="6" fill="#5c8f5a" opacity="0.35" transform="rotate(-55 82 72)"/>
      {/* T */}
      <rect x="18" y="25" width="40" height="7" rx="3.5" fill="white" opacity="0.95"/>
      <rect x="32" y="25" width="7" height="42" rx="3.5" fill="white" opacity="0.95"/>
      {/* Z overlapping */}
      <rect x="42" y="38" width="38" height="6" rx="3" fill="white"/>
      <path d="M72 38 L44 68" stroke="white" strokeWidth="6" strokeLinecap="round"/>
      <rect x="42" y="62" width="38" height="6" rx="3" fill="white"/>
    </svg>
  );
}

// ── Leaf Background SVG ───────────────────────────────────────────────────────
function LeafBg(){
  return(
    <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,pointerEvents:"none",zIndex:0,overflow:"hidden",maxWidth:480,margin:"0 auto"}}>
      <svg width="100%" height="100%" viewBox="0 0 480 900" preserveAspectRatio="xMidYMid slice" style={{position:"absolute",top:0,left:0}}>
        <defs>
          <radialGradient id="bgMain" cx="30%" cy="20%" r="80%">
            <stop offset="0%" stopColor="#e8f0e8" stopOpacity="0.6"/>
            <stop offset="100%" stopColor="#f5f0e8" stopOpacity="0"/>
          </radialGradient>
        </defs>
        <rect width="480" height="900" fill="url(#bgMain)"/>
        {/* Large background leaves */}
        <ellipse cx="420" cy="80" rx="120" ry="55" fill="#c8dcc8" opacity="0.18" transform="rotate(-25 420 80)"/>
        <ellipse cx="60" cy="200" rx="90" ry="42" fill="#b8d4b0" opacity="0.15" transform="rotate(20 60 200)"/>
        <ellipse cx="440" cy="380" rx="100" ry="46" fill="#c0d8b8" opacity="0.14" transform="rotate(-40 440 380)"/>
        <ellipse cx="30" cy="500" rx="80" ry="36" fill="#c8dcc0" opacity="0.12" transform="rotate(15 30 500)"/>
        <ellipse cx="460" cy="650" rx="110" ry="50" fill="#b8d0b0" opacity="0.13" transform="rotate(-30 460 650)"/>
        <ellipse cx="80" cy="780" rx="95" ry="44" fill="#c0d8b8" opacity="0.11" transform="rotate(35 80 780)"/>
        {/* Leaf veins */}
        <line x1="420" y1="55" x2="420" y2="105" stroke="#a8c8a0" strokeWidth="1.5" opacity="0.2" transform="rotate(-25 420 80)"/>
        <line x1="60" y1="178" x2="60" y2="222" stroke="#a0c098" strokeWidth="1.5" opacity="0.18" transform="rotate(20 60 200)"/>
      </svg>
    </div>
  );
}

export default function TrackadenZ(){
  const[user,setUser]=useState(null);
  const[onboarding,setOnboarding]=useState(false);
  const[tab,setTab]=useState("dashboard");
  const[tabTransition,setTabTransition]=useState(false);
  const[log,setLog]=useState({});
  const[goals,setGoals]=useState({calories:2000,protein:150});
  const[stepsData,setStepsData]=useState({});
  const[stepsPerm,setStepsPerm]=useState(null);
  const[workoutPlans,setWorkoutPlans]=useState([]);
  const[workoutLog,setWorkoutLog]=useState({});
  const[favorites,setFavorites]=useState([]);
  const[notif,setNotif]=useState(null);
  const[addModal,setAddModal]=useState(null);
  const[addMode,setAddMode]=useState("search");
  const[camPerm,setCamPerm]=useState(null);
  const[camModal,setCamModal]=useState(false);
  const[pendingCam,setPendingCam]=useState(null);
  const[scanning,setScanning]=useState(false);
  const[scannedCode,setScannedCode]=useState("");
  const[searchQ,setSearchQ]=useState("");
  const[searchRes,setSearchRes]=useState([]);
  const[selFood,setSelFood]=useState(null);
  const[grams,setGrams]=useState(100);
  const[aiInput,setAiInput]=useState("");
  const[aiLoading,setAiLoading]=useState(false);
  const[aiResult,setAiResult]=useState(null);
  const[imgFile,setImgFile]=useState(null);
  const[imgPreview,setImgPreview]=useState(null);
  const[kbUp,setKbUp]=useState(false);
  const[ob,setOb]=useState({step:0,name:"",gender:"male",age:"",weight:"",height:"",activity:"moderate",goal:"maintain",sport:"none"});
  const videoRef=useRef(null);
  const canvasRef=useRef(null);
  const streamRef=useRef(null);
  const scanLoopRef=useRef(null);
  const scanActiveRef=useRef(false);
  const fileRef=useRef();
  const barcodeInputRef=useRef();
  const searchInputRef=useRef();
  const modalBodyRef=useRef();
  const tabAnimRef=useRef(null);

  useEffect(()=>{
    const u=ls(K.USER,null);
    if(u){setUser(u);setGoals(ls(K.GOALS,{calories:calcTDEE(u)||2000,protein:calcProt(u)}));}
    else setOnboarding(true);
    setLog(ls(K.LOG,{}));setStepsData(ls(K.STEPS,{}));
    setStepsPerm(ls("tz_steps_perm",null));setCamPerm(ls("tz_cam_perm",null));
    setWorkoutPlans(ls(K.WP,[]));setWorkoutLog(ls(K.WL,{}));
    setFavorites(ls(K.FAVS,[]));
  },[]);

  // Zoom prevention
  useEffect(()=>{
    const prevent=e=>{if(e.touches&&e.touches.length>1)e.preventDefault();};
    let lastT=0;
    const preventDT=e=>{const now=Date.now();if(now-lastT<=300)e.preventDefault();lastT=now;};
    document.addEventListener("touchstart",prevent,{passive:false});
    document.addEventListener("touchend",preventDT,{passive:false});
    const preventG=e=>e.preventDefault();
    document.addEventListener("gesturestart",preventG);
    document.addEventListener("gesturechange",preventG);
    return()=>{document.removeEventListener("touchstart",prevent);document.removeEventListener("touchend",preventDT);document.removeEventListener("gesturestart",preventG);document.removeEventListener("gesturechange",preventG);};
  },[]);

  useEffect(()=>{
    let m=document.querySelector('meta[name="viewport"]');
    if(!m){m=document.createElement("meta");m.name="viewport";document.head.appendChild(m);}
    m.content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover";
  },[]);

  // Keyboard detection – improved for iOS
  useEffect(()=>{
    const onResize=()=>{
      const ratio=window.visualViewport?window.visualViewport.height/window.screen.height:window.innerHeight/window.screen.height;
      setKbUp(ratio<0.75);
    };
    window.visualViewport?.addEventListener("resize",onResize);
    window.addEventListener("resize",onResize);
    return()=>{window.visualViewport?.removeEventListener("resize",onResize);window.removeEventListener("resize",onResize);};
  },[]);

  useEffect(()=>{
    const check=()=>{const td=todayKey();if(ls("tz_reset","")!==td)lsSet("tz_reset",td);};
    check();const t=setInterval(check,60000);return()=>clearInterval(t);
  },[]);

  function showNotif(msg,type="ok"){setNotif({msg,type});setTimeout(()=>setNotif(null),2600);}

  function switchTab(newTab){
    if(newTab===tab)return;
    haptic("light");
    setTabTransition(true);
    clearTimeout(tabAnimRef.current);
    setTab(newTab);
    tabAnimRef.current=setTimeout(()=>setTabTransition(false),1400);
  }

  // Camera
  function requestCamera(action){
    if(camPerm==="granted"){action==="barcode"?startScanner():setAddMode("image");return;}
    setPendingCam(action);setCamModal(true);
  }
  async function grantCamera(){
    setCamModal(false);
    try{
      const s=await navigator.mediaDevices.getUserMedia({video:{facingMode:"environment"}});
      s.getTracks().forEach(t=>t.stop());
      setCamPerm("granted");lsSet("tz_cam_perm","granted");showNotif("📷 Kamerazugriff erteilt!");
      if(pendingCam==="barcode")setTimeout(startScanner,300);else setAddMode("image");
    }catch{setCamPerm("denied");lsSet("tz_cam_perm","denied");showNotif("❌ Kamerazugriff verweigert","err");}
    setPendingCam(null);
  }
  function denyCamera(){setCamModal(false);setCamPerm("denied");lsSet("tz_cam_perm","denied");setPendingCam(null);}

  // GTIN Scanner
  async function startScanner(){
    setScanning(true);setScannedCode("");setAiResult(null);
    scanActiveRef.current=true;
    const hints=new Map();
    hints.set(DecodeHintType.POSSIBLE_FORMATS,[BarcodeFormat.EAN_13,BarcodeFormat.EAN_8,BarcodeFormat.UPC_A,BarcodeFormat.UPC_E,BarcodeFormat.CODE_128,BarcodeFormat.CODE_39,BarcodeFormat.ITF]);
    hints.set(DecodeHintType.TRY_HARDER,true);
    const zxReader=new MultiFormatReader();zxReader.setHints(hints);
    try{
      const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:"environment"},width:{ideal:1920},height:{ideal:1080}}});
      streamRef.current=stream;
      const vid=videoRef.current;if(!vid){stopScanner();return;}
      vid.srcObject=stream;vid.setAttribute("playsinline","true");await vid.play();
      await new Promise(res=>{if(vid.videoWidth>0){res();return;}vid.addEventListener("loadedmetadata",res,{once:true});});
      const canvas=canvasRef.current;
      const tick=()=>{
        if(!scanActiveRef.current)return;
        try{
          const vw=vid.videoWidth,vh=vid.videoHeight;
          if(vw>0&&vh>0){
            const cropW=Math.floor(vw*.6),cropH=Math.floor(vh*.4);
            const cropX=Math.floor((vw-cropW)/2),cropY=Math.floor((vh-cropH)/2);
            canvas.width=cropW;canvas.height=cropH;
            const ctx=canvas.getContext("2d",{willReadFrequently:true});
            ctx.drawImage(vid,cropX,cropY,cropW,cropH,0,0,cropW,cropH);
            const imgData=ctx.getImageData(0,0,cropW,cropH);
            const len=cropW*cropH;const gray=new Uint8ClampedArray(len);
            for(let i=0;i<len;i++){const j=i*4;gray[i]=(imgData.data[j]*77+imgData.data[j+1]*150+imgData.data[j+2]*29)>>8;}
            const lum=new RGBLuminanceSource(gray,cropW,cropH);
            const bitmap=new BinaryBitmap(new HybridBinarizer(lum));
            try{const result=zxReader.decode(bitmap);if(result){const code=result.getText();if(code&&code.length>=6){stopScanner();setScannedCode(code);lookupGTIN(code);return;}}}catch{}
          }
        }catch{}
        scanLoopRef.current=setTimeout(tick,200);
      };
      scanLoopRef.current=setTimeout(tick,400);
    }catch{scanActiveRef.current=false;setScanning(false);showNotif("❌ Kamera nicht verfügbar","err");}
  }
  function stopScanner(){
    scanActiveRef.current=false;setScanning(false);clearTimeout(scanLoopRef.current);
    if(streamRef.current){try{streamRef.current.getTracks().forEach(t=>t.stop());}catch{}streamRef.current=null;}
    if(videoRef.current&&videoRef.current.srcObject){try{videoRef.current.srcObject.getTracks().forEach(t=>t.stop());}catch{}videoRef.current.srcObject=null;}
  }
  async function lookupGTIN(code){
    if(!code||code.length<6)return;
    setAiLoading(true);setAiResult(null);
    try{const r=await fetch(`https://world.openfoodfacts.org/api/v0/product/${code}.json`);const d=await r.json();if(d.status===1&&d.product){const p=d.product;const n=p.nutriments||{};setAiResult({items:[{name:p.product_name||p.generic_name||"Unbekannt",grams:100,calories:Math.round(n["energy-kcal_100g"]||n["energy-kcal"]||0),protein:+(n.proteins_100g||0).toFixed(1),carbs:+(n.carbohydrates_100g||0).toFixed(1),fat:+(n.fat_100g||0).toFixed(1),emoji:"🏪"}]});setAiLoading(false);return;}}catch{}
    try{const res=await callClaude(`Du bist eine Lebensmitteldatenbank. Identifiziere das Produkt anhand des GTIN/EAN Barcodes und gib Nährwerte zurück. Antworte NUR mit JSON: {"items":[{"name":"...","grams":100,"calories":0,"protein":0,"carbs":0,"fat":0,"emoji":"🏪"}]}`,`GTIN/EAN: ${code}`);setAiResult(res);}catch{showNotif("❌ Produkt nicht gefunden","err");}
    setAiLoading(false);
  }

  useEffect(()=>{if(!addModal)stopScanner();},[addModal]);

  const tk=todayKey();
  const todayE=log[tk]||[];
  const totals=todayE.reduce((a,e)=>({calories:a.calories+e.calories,protein:a.protein+e.protein,carbs:a.carbs+e.carbs,fat:a.fat+e.fat}),{calories:0,protein:0,carbs:0,fat:0});
  const calPct=Math.min(100,(totals.calories/goals.calories)*100);
  const protPct=Math.min(100,(totals.protein/goals.protein)*100);

  function addEntry(entry){
    haptic("medium");
    const nl={...log};if(!nl[tk])nl[tk]=[];
    nl[tk]=[...nl[tk],{...entry,id:Date.now(),time:new Date().toLocaleTimeString("de-DE",{hour:"2-digit",minute:"2-digit"})}];
    setLog(nl);lsSet(K.LOG,nl);
    const favKey=`${entry.emoji}|${entry.name}|${entry.grams}`;
    const existing=favorites.find(f=>f.key===favKey);
    const newFavs=existing?favorites.map(f=>f.key===favKey?{...f,count:f.count+1,lastUsed:Date.now()}:f):[...favorites,{key:favKey,name:entry.name,emoji:entry.emoji,grams:entry.grams,calories:entry.calories,protein:entry.protein,carbs:entry.carbs,fat:entry.fat,count:1,lastUsed:Date.now()}];
    setFavorites(newFavs);lsSet(K.FAVS,newFavs);
    closeModal();showNotif("✅ Mahlzeit eingetragen!");
  }
  function addFromFavorite(fav){addEntry({name:fav.name,emoji:fav.emoji,grams:fav.grams,mealType:addModal?.mealType||"snack",calories:fav.calories,protein:fav.protein,carbs:fav.carbs,fat:fav.fat});}
  function removeFavorite(key){const nf=favorites.filter(f=>f.key!==key);setFavorites(nf);lsSet(K.FAVS,nf);showNotif("🗑️ Entfernt","err");}
  function removeEntry(id){haptic("light");const nl={...log,[tk]:(log[tk]||[]).filter(e=>e.id!==id)};setLog(nl);lsSet(K.LOG,nl);showNotif("🗑️ Entfernt","err");}
  function closeModal(){setAddModal(null);setSelFood(null);setSearchQ("");setSearchRes([]);setGrams(100);setAiInput("");setAiResult(null);setImgFile(null);setImgPreview(null);stopScanner();setScannedCode("");}
  function calcN(food,g){const r=g/100;return{calories:Math.round(food.calories*r),protein:+(food.protein*r).toFixed(1),carbs:+(food.carbs*r).toFixed(1),fat:+(food.fat*r).toFixed(1)};}
  function handleSearch(q){setSearchQ(q);setSelFood(null);setSearchRes(searchFoods(q));}
  function handleSelectFood(f){haptic("light");setSelFood(f);setSearchRes([]);setSearchQ(f.name);}

  async function callClaude(sys,userMsg,imgData){
    const content=imgData?[{type:"image",source:{type:"base64",media_type:imgData.type,data:imgData.data}},{type:"text",text:userMsg}]:userMsg;
    const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json","anthropic-dangerous-direct-browser-access":"true"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,system:sys,messages:[{role:"user",content}]})});
    const d=await r.json();if(d.error)throw new Error(d.error.message);
    return JSON.parse(d.content.map(c=>c.text||"").join("").replace(/```json|```/g,"").trim());
  }
  async function handleAiAnalyze(){if(!aiInput.trim())return;setAiLoading(true);setAiResult(null);try{setAiResult(await callClaude(`Du bist Ernährungsexperte. Antworte NUR mit JSON: {"items":[{"name":"...","grams":100,"calories":0,"protein":0,"carbs":0,"fat":0,"emoji":"🍽️"}]}`,`Analysiere: ${aiInput}`));}catch(e){showNotif(`❌ KI: ${e.message?.includes("API key")||e.message?.includes("auth")?"API-Key fehlt":"Fehler"}`, "err");}setAiLoading(false);}
  async function handleImgAnalyze(){if(!imgFile)return;setAiLoading(true);setAiResult(null);try{const b64=await new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result.split(",")[1]);r.onerror=rej;r.readAsDataURL(imgFile);});setAiResult(await callClaude(`Du bist Ernährungsexperte. Antworte NUR mit JSON: {"items":[{"name":"...","grams":100,"calories":0,"protein":0,"carbs":0,"fat":0,"emoji":"🍽️"}]}`,"Analysiere diese Mahlzeit.",{type:imgFile.type,data:b64}));}catch{showNotif("❌ Fehler","err");}setAiLoading(false);}
  function handleAddAiResult(){if(!aiResult?.items?.length)return;const t=aiResult.items.reduce((a,i)=>({calories:a.calories+i.calories,protein:a.protein+i.protein,carbs:a.carbs+(i.carbs||0),fat:a.fat+(i.fat||0)}),{calories:0,protein:0,carbs:0,fat:0});addEntry({name:aiResult.items.map(i=>i.name).join(", "),emoji:aiResult.items[0]?.emoji||"🍽️",grams:aiResult.items.reduce((s,i)=>s+(i.grams||0),0),mealType:addModal?.mealType||"snack",calories:Math.round(t.calories),protein:+t.protein.toFixed(1),carbs:+t.carbs.toFixed(1),fat:+t.fat.toFixed(1)});}

  function finishOnboarding(){const u={...ob,weight:Number(ob.weight),height:Number(ob.height),age:Number(ob.age),createdAt:new Date().toISOString()};const g={calories:calcTDEE(u)||2000,protein:calcProt(u)};setUser(u);setGoals(g);lsSet(K.USER,u);lsSet(K.GOALS,g);setOnboarding(false);haptic("heavy");showNotif(`🌿 Willkommen, ${u.name}!`);}

  const todaySteps=stepsData[tk]||0;
  function requestSteps(){if("DeviceMotionEvent" in window&&typeof DeviceMotionEvent.requestPermission==="function"){DeviceMotionEvent.requestPermission().then(res=>{const ok=res==="granted";setStepsPerm(ok?"granted":"denied");lsSet("tz_steps_perm",ok?"granted":"denied");if(ok)showNotif("✅ Schrittzähler aktiv!");});}else{setStepsPerm("granted");lsSet("tz_steps_perm","granted");showNotif("✅ Schrittzähler aktiv!");}}
  function logSteps(n){haptic("light");const s={...stepsData,[tk]:n};setStepsData(s);lsSet(K.STEPS,s);}

  const last7Days=Array.from({length:7},(_,i)=>{const d=new Date();d.setDate(d.getDate()-(6-i));const key=dateKey(d);const entries=log[key]||[];return{date:d,key,label:d.toLocaleDateString("de-DE",{weekday:"short"}).slice(0,2),dayNum:d.getDate(),calories:Math.round(entries.reduce((s,e)=>s+e.calories,0)),isToday:key===tk};});
  const weekTotalCal=last7Days.reduce((s,d)=>s+d.calories,0);
  const weekAvgCal=Math.round(weekTotalCal/7);
  const historyDays=Object.entries(log).sort((a,b)=>new Date(b[0])-new Date(a[0])).slice(0,30).map(([dk,entries])=>({dk,calories:Math.round(entries.reduce((s,e)=>s+e.calories,0)),protein:+entries.reduce((s,e)=>s+e.protein,0).toFixed(1),carbs:+entries.reduce((s,e)=>s+e.carbs,0).toFixed(1),fat:+entries.reduce((s,e)=>s+e.fat,0).toFixed(1),isToday:dk===tk}));
  const mealsByType=MEAL_TYPES.map(mt=>({...mt,entries:todayE.filter(e=>e.mealType===mt.id)}));
  function saveWP(p){setWorkoutPlans(p);lsSet(K.WP,p);}
  function saveWL(w){setWorkoutLog(w);lsSet(K.WL,w);}
  const bmi=user?.weight&&user?.height?(user.weight/((user.height/100)**2)).toFixed(1):null;
  const sprinterEmoji=user?.gender==="female"?"🏃‍♀️":"🏃";
  const topFavorites=[...favorites].sort((a,b)=>b.count-a.count).slice(0,6);

  const navItems=[
    {id:"dashboard",icon:"⚡",label:"Heute"},
    {id:"log",icon:"🍽️",label:"Mahlzeiten"},
    {id:"history",icon:"📊",label:"Verlauf"},
    {id:"workout",icon:"🏋️",label:"Training"},
    {id:"profile",icon:"👤",label:"Profil"},
  ];

  // ─── ONBOARDING ────────────────────────────────────────────────────────────
  if(onboarding){
    const steps=[{title:"Willkommen 🌿",sub:"Wie heißt du?"},{title:"Dein Körper 📏",sub:"Zur Kalorien-Berechnung"},{title:"Dein Ziel 🎯",sub:"Was möchtest du erreichen?"},{title:"Deine Aktivität 🏃",sub:"Wie aktiv bist du?"}];
    const pct=((ob.step+1)/steps.length)*100;
    const obStyle={fontFamily:"'DM Sans',sans-serif",background:`linear-gradient(160deg,#e8f0e4 0%,${C.bg} 50%,#f0e8dc 100%)`,minHeight:"100svh",maxWidth:480,margin:"0 auto",display:"flex",flexDirection:"column",position:"relative"};
    return(
      <div style={obStyle}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@700;800&display=swap');*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}input,textarea{font-size:16px!important}input:focus,textarea:focus{outline:2px solid ${C.leaf};border-color:${C.leaf}!important}button{cursor:pointer;border:none;font-family:inherit}@keyframes slideUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`}</style>
        <LeafBg/>
        <div style={{flex:1,overflowY:"auto",padding:"40px 24px 20px",position:"relative",zIndex:1}}>
          <div style={{textAlign:"center",marginBottom:32}}>
            <TZIcon size={72}/>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:30,fontWeight:800,color:C.text,marginTop:12}}>TrackadenZ</div>
            <div style={{fontSize:13,color:C.muted,marginTop:4}}>Dein natürlicher Fitness-Begleiter</div>
          </div>
          <div style={{height:4,background:C.border,borderRadius:2,marginBottom:28,overflow:"hidden"}}><div style={{height:"100%",borderRadius:2,background:`linear-gradient(90deg,${C.leaf},${C.sage})`,width:`${pct}%`,transition:"width .5s ease"}}/></div>
          <div style={{animation:"slideUp .3s ease"}}>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:800,color:C.text,marginBottom:4}}>{steps[ob.step].title}</div>
            <div style={{fontSize:13,color:C.muted,marginBottom:22}}>{steps[ob.step].sub}</div>

            {ob.step===0&&<div>
              <div style={{fontSize:12,color:C.textSec,fontWeight:700,marginBottom:6,textTransform:"uppercase",letterSpacing:.5}}>Dein Name</div>
              <input style={{...sInput(),marginBottom:16}} placeholder="z.B. Max" value={ob.name} onChange={e=>setOb(o=>({...o,name:e.target.value}))} autoFocus/>
              <div style={{fontSize:12,color:C.textSec,fontWeight:700,marginBottom:10,textTransform:"uppercase",letterSpacing:.5}}>Geschlecht</div>
              <div style={{display:"flex",gap:10}}>
                {[{id:"male",l:"♂ Männlich"},{id:"female",l:"♀ Weiblich"}].map(g=>(
                  <button key={g.id} onClick={()=>setOb(o=>({...o,gender:g.id}))} style={{flex:1,padding:"13px 10px",borderRadius:14,fontSize:14,fontWeight:700,background:ob.gender===g.id?C.leaf:C.surface,color:ob.gender===g.id?"#fff":C.muted,border:`2px solid ${ob.gender===g.id?C.leaf:C.border}`,transition:"all .2s"}}>{g.l}</button>
                ))}
              </div>
            </div>}

            {ob.step===1&&<div>
              {[{k:"age",l:"Alter (Jahre)",p:"z.B. 25"},{k:"weight",l:"Gewicht (kg)",p:"z.B. 80"},{k:"height",l:"Körpergröße (cm)",p:"z.B. 178"}].map(f=>(
                <div key={f.k} style={{marginBottom:14}}>
                  <div style={{fontSize:12,color:C.textSec,fontWeight:700,marginBottom:6,textTransform:"uppercase",letterSpacing:.5}}>{f.l}</div>
                  <input type="number" inputMode="decimal" style={sInput()} placeholder={f.p} value={ob[f.k]} onChange={e=>setOb(o=>({...o,[f.k]:e.target.value}))}/>
                </div>
              ))}
              {ob.age&&ob.weight&&ob.height&&(()=>{const b=(ob.weight/((ob.height/100)**2)).toFixed(1);const cat=b<18.5?"Untergewicht":b<25?"Normalgewicht ✓":b<30?"Übergewicht":"Adipositas";return<div style={{background:C.leafSoft,borderRadius:16,padding:16,border:`1px solid ${C.borderStrong}`,marginTop:4}}><div style={{fontSize:11,color:C.muted,fontWeight:600}}>Dein BMI</div><div style={{fontFamily:"'Playfair Display',serif",fontSize:28,fontWeight:800,color:C.leaf}}>{b}</div><div style={{fontSize:12,color:C.textSec}}>{cat}</div></div>;})()}
            </div>}

            {ob.step===2&&<div>
              {[{id:"lose",l:"🔥 Abnehmen",s:"−500 kcal Defizit"},{id:"maintain",l:"⚖️ Gewicht halten",s:"Erhaltungskalorien"},{id:"gain",l:"💪 Aufbauen",s:"+300 kcal Überschuss"}].map(g=>(
                <button key={g.id} onClick={()=>setOb(o=>({...o,goal:g.id}))} style={{width:"100%",background:ob.goal===g.id?C.leafSoft:C.surface,border:`2px solid ${ob.goal===g.id?C.leaf:C.border}`,borderRadius:16,padding:"14px 18px",marginBottom:10,display:"flex",justifyContent:"space-between",alignItems:"center",color:C.text,transition:"all .2s"}}>
                  <span style={{fontWeight:700,fontSize:15}}>{g.l}</span>
                  <span style={{fontSize:12,color:C.muted}}>{g.s}</span>
                </button>
              ))}
              <div style={{fontSize:12,color:C.textSec,fontWeight:700,margin:"16px 0 10px",textTransform:"uppercase",letterSpacing:.5}}>Sport pro Woche</div>
              <div style={{display:"flex",gap:8}}>
                {[{id:"none",l:"Kein"},{id:"light",l:"1–2×"},{id:"moderate",l:"3–4×"},{id:"heavy",l:"5+×"}].map(s=>(
                  <button key={s.id} onClick={()=>setOb(o=>({...o,sport:s.id}))} style={{flex:1,padding:"10px 4px",borderRadius:12,fontSize:12,fontWeight:700,background:ob.sport===s.id?C.leaf:C.surface,color:ob.sport===s.id?"#fff":C.muted,border:`2px solid ${ob.sport===s.id?C.leaf:C.border}`,transition:"all .15s"}}>{s.l}</button>
                ))}
              </div>
            </div>}

            {ob.step===3&&<div>
              {[{id:"sedentary",l:"🪑 Hauptsächlich sitzend",s:"Bürojob"},{id:"light",l:"🚶 Leicht aktiv",s:"Wenig Sport"},{id:"moderate",l:"🚴 Moderat aktiv",s:"3–5×/Woche"},{id:"active",l:"🏃 Sehr aktiv",s:"Tägl. Training"},{id:"veryActive",l:"⚡ Extrem aktiv",s:"Körperl. Arbeit+Sport"}].map(a=>(
                <button key={a.id} onClick={()=>setOb(o=>({...o,activity:a.id}))} style={{width:"100%",background:ob.activity===a.id?C.leafSoft:C.surface,border:`2px solid ${ob.activity===a.id?C.leaf:C.border}`,borderRadius:14,padding:"12px 16px",marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center",color:C.text,transition:"all .2s"}}>
                  <span style={{fontWeight:700,fontSize:14}}>{a.l}</span>
                  <span style={{fontSize:11,color:C.muted}}>{a.s}</span>
                </button>
              ))}
              {(()=>{const preview=calcTDEE({...ob,weight:Number(ob.weight),height:Number(ob.height),age:Number(ob.age)});return preview?<div style={{background:`linear-gradient(135deg,${C.leafSoft},${C.dandelionSoft})`,borderRadius:16,padding:16,border:`1px solid ${C.borderStrong}`,marginTop:12}}><div style={{fontSize:11,color:C.muted,fontWeight:600}}>Dein Tagesbedarf</div><div style={{fontFamily:"'Playfair Display',serif",fontSize:30,fontWeight:800,color:C.leaf}}>{preview}<span style={{fontSize:14,fontWeight:400,color:C.textSec}}> kcal</span></div><div style={{fontSize:12,color:C.textSec,marginTop:2}}>Protein: {calcProt({...ob,weight:Number(ob.weight)})}g täglich</div></div>:null;})()}
            </div>}
          </div>
        </div>
        <div style={{padding:"14px 24px 32px",background:"rgba(245,240,232,0.95)",backdropFilter:"blur(12px)",display:"flex",gap:12,position:"relative",zIndex:1,borderTop:`1px solid ${C.border}`}}>
          {ob.step>0&&<button onClick={()=>setOb(o=>({...o,step:o.step-1}))} style={{flex:1,padding:"14px",borderRadius:14,fontSize:14,fontWeight:700,background:C.surface,color:C.textSec,border:`1.5px solid ${C.border}`}}>← Zurück</button>}
          <button onClick={()=>ob.step<3?setOb(o=>({...o,step:o.step+1})):finishOnboarding()} disabled={ob.step===0&&!ob.name.trim()} style={{flex:2,padding:"14px",borderRadius:14,fontSize:15,fontWeight:700,background:`linear-gradient(135deg,${C.leaf},${C.moss})`,color:"#fff",border:"none",opacity:ob.step===0&&!ob.name.trim()?.4:1,boxShadow:`0 4px 20px ${C.leaf}44`}}>
            {ob.step<3?"Weiter →":"🌿 Loslegen!"}
          </button>
        </div>
      </div>
    );
  }

  // ─── MAIN APP ──────────────────────────────────────────────────────────────
  return(
    <div style={{fontFamily:"'DM Sans',sans-serif",background:C.bg,minHeight:"100svh",maxWidth:480,margin:"0 auto",color:C.text,display:"flex",flexDirection:"column",position:"relative",overflow:"hidden"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent;-webkit-text-size-adjust:100%;touch-action:manipulation}
        html,body{overscroll-behavior:none;-webkit-user-select:none;user-select:none}
        input,textarea{-webkit-user-select:text;user-select:text;font-size:16px!important}
        input:focus,textarea:focus{outline:2px solid ${C.leaf};outline-offset:1px;border-color:${C.leaf}!important}
        button{cursor:pointer;border:none;font-family:inherit;-webkit-tap-highlight-color:transparent}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:${C.dim};border-radius:2px}
        @keyframes slideUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
        @keyframes scanLine{0%,100%{transform:translateY(-28px);opacity:.3}50%{transform:translateY(28px);opacity:1}}
        @keyframes sprintAcross{0%{transform:translateX(120vw) scale(.9);opacity:0}10%{opacity:1}85%{opacity:1}100%{transform:translateX(-140%) scale(1.1);opacity:0}}
        @keyframes sprintTrail{0%{opacity:0;transform:translateX(120vw)}15%{opacity:.5}100%{opacity:0;transform:translateX(-140%)}}
        @keyframes tabFade{0%{opacity:0;transform:translateY(8px)}100%{opacity:1;transform:translateY(0)}}
        @keyframes popIn{0%{transform:scale(.92);opacity:0}100%{transform:scale(1);opacity:1}}
        .anim{animation:slideUp .22s ease}
        .tab-content{animation:tabFade .3s ease}
        input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none;margin:0}
        input[type=number]{-moz-appearance:textfield}
        textarea{resize:none;line-height:1.5}
        button:active{transform:scale(0.97);transition:transform .08s}
      `}</style>

      <LeafBg/>

      {/* Sprint animation */}
      {tabTransition&&(
        <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,pointerEvents:"none",zIndex:500,overflow:"hidden"}}>
          <div style={{position:"absolute",top:"50%",left:0,transform:"translateY(-50%) scaleX(-1)",fontSize:96,animation:"sprintAcross 1.4s cubic-bezier(0.4,0,0.2,1) forwards",filter:`drop-shadow(0 4px 16px ${C.leaf}66)`,willChange:"transform"}}>
            {sprinterEmoji}
          </div>
          <div style={{position:"absolute",top:"calc(50% + 6px)",left:0,right:0,transform:"translateY(-50%)",height:3,background:`linear-gradient(90deg,transparent,${C.sage},transparent)`,borderRadius:2,animation:"sprintTrail 1.4s cubic-bezier(0.4,0,0.2,1) forwards"}}/>
        </div>
      )}

      {/* Toast */}
      {notif&&<div style={{position:"fixed",top:20,left:"50%",transform:"translateX(-50%)",background:notif.type==="err"?"#fff0f0":C.leafSoft,border:`1px solid ${notif.type==="err"?"#f5b8b8":C.borderStrong}`,color:notif.type==="err"?"#c0392b":C.leaf,padding:"11px 22px",borderRadius:14,fontSize:13,fontWeight:700,zIndex:9999,whiteSpace:"nowrap",boxShadow:C.shadowMd,animation:"slideUp .2s ease"}}>{notif.msg}</div>}

      {/* Header */}
      <div style={{background:"rgba(250,248,242,0.92)",backdropFilter:"blur(16px)",borderBottom:`1px solid ${C.border}`,padding:"calc(env(safe-area-inset-top,0) + 12px) 20px 14px",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0,zIndex:100,boxShadow:`0 1px 12px rgba(74,124,89,0.08)`,position:"relative"}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <TZIcon size={36}/>
          <div>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:800,color:C.text,lineHeight:1.1}}>TrackadenZ</div>
            <div style={{fontSize:11,color:C.muted,marginTop:1}}>{new Date().toLocaleDateString("de-DE",{weekday:"long",day:"numeric",month:"long"})}</div>
          </div>
        </div>
        {user&&<div style={{width:36,height:36,borderRadius:"50%",background:`linear-gradient(135deg,${C.leaf},${C.moss})`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Playfair Display',serif",fontWeight:800,fontSize:15,color:"#fff",boxShadow:`0 2px 10px ${C.leaf}44`}}>{user.name?.[0]?.toUpperCase()}</div>}
      </div>

      {/* Content */}
      <div key={tab} className="tab-content" style={{flex:1,overflowY:"auto",overflowX:"hidden",padding:"16px 16px 88px",WebkitOverflowScrolling:"touch",position:"relative",zIndex:1}}>

        {/* ── DASHBOARD ──────────────────────────────────────────────────── */}
        {tab==="dashboard"&&<div>
          <div style={{marginBottom:14}}>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:800,color:C.text}}>Guten Tag, {user?.name} 🌿</div>
            <div style={{fontSize:12,color:C.muted,marginTop:2}}>{goals.calories-Math.round(totals.calories)>0?`Noch ${goals.calories-Math.round(totals.calories)} kcal heute verfügbar`:"🎉 Tagesziel erreicht!"}</div>
          </div>

          {/* Kalorien Card */}
          <div style={{...sCard({background:`linear-gradient(135deg,${C.leafSoft},${C.dandelionSoft})`,marginBottom:14,border:`1px solid ${C.borderStrong}`})}}>
            <div style={{display:"flex",alignItems:"center",gap:18}}>
              <div style={{position:"relative",flexShrink:0}}>
                <svg width={96} height={96} style={{transform:"rotate(-90deg)"}}>
                  <circle cx={48} cy={48} r={40} fill="none" stroke={C.border} strokeWidth={8}/>
                  <circle cx={48} cy={48} r={40} fill="none" stroke={calPct>=100?"#c9607a":C.leaf} strokeWidth={8} strokeLinecap="round" strokeDasharray={251} strokeDashoffset={251-(251*calPct)/100} style={{transition:"stroke-dashoffset .8s ease"}}/>
                </svg>
                <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",textAlign:"center"}}>
                  <div style={{fontFamily:"'Playfair Display',serif",fontSize:17,fontWeight:800,color:C.text,lineHeight:1}}>{Math.round(totals.calories)}</div>
                  <div style={{fontSize:9,color:C.muted,fontWeight:600}}>kcal</div>
                </div>
              </div>
              <div style={{flex:1}}>
                {[{l:"Kalorien",cur:Math.round(totals.calories),goal:goals.calories,unit:"kcal",color:C.leaf,pct:calPct},{l:"Protein",cur:totals.protein,goal:goals.protein,unit:"g",color:C.azalea,pct:protPct}].map(s=>(
                  <div key={s.l} style={{marginBottom:10}}>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}><span style={{color:C.muted,fontWeight:600}}>{s.l}</span><span style={{color:C.text,fontWeight:700}}>{s.cur}/{s.goal}{s.unit}</span></div>
                    <div style={{height:5,background:"rgba(255,255,255,.5)",borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",borderRadius:3,background:s.pct>=100?"#c9607a":s.color,width:`${s.pct}%`,transition:"width .8s"}}/></div>
                  </div>
                ))}
                <div style={{display:"flex",gap:8}}>
                  {[{l:"Carbs",v:`${totals.carbs}g`,c:C.dandelion},{l:"Fett",v:`${totals.fat}g`,c:C.smokeOrange}].map(s=><div key={s.l} style={{flex:1,background:"rgba(255,255,255,.7)",borderRadius:10,padding:"6px 8px",textAlign:"center"}}><div style={{fontSize:13,fontWeight:800,color:s.c}}>{s.v}</div><div style={{fontSize:9,color:C.muted,fontWeight:600}}>{s.l}</div></div>)}
                </div>
              </div>
            </div>
          </div>

          {/* Week overview */}
          <div style={{...sCard({marginBottom:14})}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <div><div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:.6,textTransform:"uppercase"}}>Diese Woche</div><div style={{fontSize:11,color:C.textSec,marginTop:1}}>Ø {weekAvgCal} kcal/Tag</div></div>
              <div style={{textAlign:"right"}}><div style={{fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:800,color:C.leaf}}>{weekTotalCal.toLocaleString("de-DE")}</div><div style={{fontSize:9,color:C.muted,fontWeight:600}}>kcal gesamt</div></div>
            </div>
            <div style={{display:"flex",alignItems:"flex-end",gap:5,height:72,marginBottom:8}}>
              {(()=>{const maxCal=Math.max(goals.calories*1.2,...last7Days.map(d=>d.calories),100);return last7Days.map(d=>{const h=Math.max(4,(d.calories/maxCal)*60);const over=d.calories>goals.calories;return(<div key={d.key} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
                <div style={{width:"100%",borderRadius:"6px 6px 0 0",background:d.calories===0?C.border:over?C.azalea:d.isToday?`linear-gradient(180deg,${C.leaf},${C.moss})`:C.sage,height:`${h}px`,transition:"height .5s",opacity:d.calories===0?.4:1}}/>
                <div style={{fontSize:10,fontWeight:d.isToday?800:600,color:d.isToday?C.leaf:C.muted,textTransform:"uppercase"}}>{d.label}</div>
                <div style={{fontSize:8,color:C.dim}}>{d.dayNum}</div>
              </div>);});})()}
            </div>
            <div style={{display:"flex",gap:12,fontSize:9,color:C.muted,flexWrap:"wrap"}}>
              {[{c:C.leaf,l:"Heute"},{c:C.sage,l:"Im Ziel"},{c:C.azalea,l:"Über Ziel"}].map(s=><span key={s.l} style={{display:"flex",alignItems:"center",gap:4}}><span style={{width:8,height:8,borderRadius:2,background:s.c,display:"inline-block"}}/>{s.l}</span>)}
            </div>
          </div>

          {/* Steps */}
          <div style={{...sCard({marginBottom:14})}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <div style={{width:40,height:40,borderRadius:12,background:C.smokeSoft,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>👟</div>
                <div><div style={{fontSize:13,fontWeight:700}}>Schrittzähler</div>{stepsPerm==="granted"&&<div style={{fontSize:11,color:C.muted}}>~{Math.round(todaySteps*.04)} kcal verbrannt</div>}</div>
              </div>
              {stepsPerm==="granted"?<div style={{fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:800,color:C.smokeOrange}}>{todaySteps.toLocaleString("de-DE")}</div>:<button onClick={requestSteps} style={{background:C.smokeSoft,border:`1px solid ${C.smokeOrange}44`,borderRadius:10,color:C.smokeOrange,padding:"8px 14px",fontSize:12,fontWeight:700}}>Aktivieren</button>}
            </div>
            {stepsPerm==="granted"&&<div style={{marginTop:12}}>
              <div style={{height:5,background:C.border,borderRadius:3,marginBottom:10,overflow:"hidden"}}><div style={{height:"100%",borderRadius:3,background:`linear-gradient(90deg,${C.smokeOrange},${C.dandelion})`,width:`${Math.min(100,(todaySteps/10000)*100)}%`,transition:"width .5s"}}/></div>
              <div style={{display:"flex",gap:7,marginBottom:10}}>{[2000,5000,8000,10000].map(n=><button key={n} onClick={()=>logSteps(n)} style={{flex:1,background:todaySteps===n?C.smokeSoft:C.bg,border:`1.5px solid ${todaySteps===n?C.smokeOrange:C.border}`,borderRadius:10,padding:"7px 0",fontSize:11,fontWeight:700,color:todaySteps===n?C.smokeOrange:C.muted}}>{n>=1000?`${n/1000}k`:n}</button>)}</div>
              <input type="number" inputMode="numeric" placeholder="Eigene Schrittzahl eingeben…" onBlur={e=>{if(e.target.value){logSteps(Number(e.target.value));e.target.value="";}}} style={sInput({padding:"10px 14px",fontSize:14})}/>
            </div>}
          </div>

          {/* Quick add */}
          <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:.6,marginBottom:10,textTransform:"uppercase"}}>Schnell hinzufügen</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            {MEAL_TYPES.map(mt=>(
              <button key={mt.id} onClick={()=>{haptic("light");setAddModal({mealType:mt.id});setAddMode("search");}} style={{background:C.surface,border:`1.5px solid ${C.border}`,borderRadius:18,padding:"16px 16px",display:"flex",alignItems:"center",gap:12,color:C.text,fontSize:14,fontWeight:600,boxShadow:C.shadow,textAlign:"left",transition:"all .15s"}}>
                <span style={{fontSize:24}}>{mt.emoji}</span>
                <span style={{fontSize:13}}>{mt.label}</span>
              </button>
            ))}
          </div>
        </div>}

        {/* ── LOG ───────────────────────────────────────────────────────── */}
        {tab==="log"&&<div>
          {mealsByType.map(mt=>(
            <div key={mt.id} style={{marginBottom:20}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:18}}>{mt.emoji}</span>
                  <span style={{fontFamily:"'Playfair Display',serif",fontWeight:700,fontSize:15,color:C.text}}>{mt.label}</span>
                  {mt.entries.length>0&&<span style={{background:C.leafSoft,color:C.leaf,borderRadius:8,padding:"2px 8px",fontSize:10,fontWeight:700,border:`1px solid ${C.borderStrong}`}}>{Math.round(mt.entries.reduce((s,e)=>s+e.calories,0))} kcal</span>}
                </div>
                <button onClick={()=>{haptic("light");setAddModal({mealType:mt.id});setAddMode("search");}} style={{background:C.leaf,border:"none",borderRadius:10,color:"#fff",padding:"7px 14px",fontSize:12,fontWeight:700,boxShadow:`0 2px 8px ${C.leaf}44`}}>+ Add</button>
              </div>
              {mt.entries.length===0?(
                <div style={{background:"rgba(250,248,242,0.6)",borderRadius:14,padding:16,color:C.dim,fontSize:12,textAlign:"center",border:`1.5px dashed ${C.border}`}}>Noch nichts eingetragen</div>
              ):mt.entries.map(e=>(
                <div key={e.id} className="anim" style={{...sCard({marginBottom:8,padding:"12px 14px"}),display:"flex",alignItems:"center",gap:10}}>
                  <span style={{fontSize:24}}>{e.emoji}</span>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:13,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",color:C.text}}>{e.name}</div>
                    <div style={{fontSize:11,color:C.muted,marginTop:1}}>{e.grams}g · {e.time}</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:14,fontWeight:800,color:C.leaf}}>{e.calories} kcal</div>
                    <div style={{fontSize:10,color:C.azalea,fontWeight:700}}>{e.protein}g P</div>
                  </div>
                  <button onClick={()=>removeEntry(e.id)} style={{background:"none",color:C.dim,fontSize:16,padding:"4px 6px",borderRadius:8}}>✕</button>
                </div>
              ))}
            </div>
          ))}

          {topFavorites.length>0&&(
            <div style={{marginTop:24}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:.6,textTransform:"uppercase"}}>⭐ Deine Favoriten</div>
                <div style={{fontSize:10,color:C.dim}}>{topFavorites.length} Einträge</div>
              </div>
              {topFavorites.map(fav=>(
                <div key={fav.key} style={{...sCard({marginBottom:8,padding:"12px 14px"}),display:"flex",alignItems:"center",gap:10}}>
                  <span style={{fontSize:22}}>{fav.emoji}</span>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:13,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{fav.name}</div>
                    <div style={{fontSize:10,color:C.muted}}>{fav.grams}g · {fav.count}× · {fav.calories} kcal</div>
                  </div>
                  <button onClick={()=>{if(addModal)addFromFavorite(fav);else{setAddModal({mealType:"snack"});setTimeout(()=>addFromFavorite(fav),50);}}} style={{background:C.leafSoft,border:`1px solid ${C.leaf}44`,borderRadius:10,color:C.leaf,padding:"7px 12px",fontSize:12,fontWeight:700,flexShrink:0}}>+ Add</button>
                  <button onClick={()=>removeFavorite(fav.key)} style={{background:"none",color:C.dim,fontSize:14,padding:"3px 5px",flexShrink:0}}>✕</button>
                </div>
              ))}
            </div>
          )}
        </div>}

        {/* ── HISTORY ───────────────────────────────────────────────────── */}
        {tab==="history"&&<div>
          <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:.6,marginBottom:14,textTransform:"uppercase"}}>Letzte 30 Tage</div>
          {historyDays.length===0?(
            <div style={{...sCard(),textAlign:"center",padding:40,color:C.dim}}><div style={{fontSize:40,marginBottom:10}}>📊</div><div>Noch keine Daten</div></div>
          ):<>
            {historyDays.length>=2&&(()=>{const avg={cal:Math.round(historyDays.reduce((s,d)=>s+d.calories,0)/historyDays.length),prot:+(historyDays.reduce((s,d)=>s+d.protein,0)/historyDays.length).toFixed(1)};return<div style={{...sCard({background:C.leafSoft,border:`1px solid ${C.borderStrong}`,marginBottom:12}),display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}><div><div style={{fontSize:10,color:C.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:.4}}>Ø Kalorien/Tag</div><div style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:800,color:C.leaf,marginTop:2}}>{avg.cal}<span style={{fontSize:12,fontWeight:400}}> kcal</span></div></div><div><div style={{fontSize:10,color:C.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:.4}}>Ø Protein/Tag</div><div style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:800,color:C.azalea,marginTop:2}}>{avg.prot}<span style={{fontSize:12,fontWeight:400}}>g</span></div></div></div>;})()}
            <div style={{...sCard({padding:0,overflow:"hidden"})}}>
              <div style={{display:"grid",gridTemplateColumns:"2fr 1.2fr 1fr 1fr 1fr",padding:"10px 14px",background:C.bg,borderBottom:`1px solid ${C.border}`}}>
                {["Datum","Kcal","Prot.","Carbs","Fett"].map(h=><div key={h} style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:.3}}>{h}</div>)}
              </div>
              {historyDays.map((d,i)=>{const pct=Math.min(100,(d.calories/goals.calories)*100);return(
                <div key={d.dk} style={{display:"grid",gridTemplateColumns:"2fr 1.2fr 1fr 1fr 1fr",padding:"10px 14px",borderBottom:i<historyDays.length-1?`1px solid ${C.border}`:"none",background:d.isToday?C.leafSoft:"transparent"}}>
                  <div><div style={{fontSize:12,fontWeight:d.isToday?700:500,color:d.isToday?C.leaf:C.text}}>{d.isToday?"Heute":new Date(d.dk).toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit"})}</div><div style={{height:3,background:C.border,borderRadius:2,marginTop:3,overflow:"hidden",width:44}}><div style={{height:"100%",borderRadius:2,background:pct>=100?C.azalea:C.leaf,width:`${pct}%`}}/></div></div>
                  <div style={{fontSize:12,fontWeight:700,color:C.leaf}}>{d.calories}</div>
                  <div style={{fontSize:12,color:C.azalea,fontWeight:600}}>{d.protein}g</div>
                  <div style={{fontSize:12,color:C.dandelion}}>{d.carbs}g</div>
                  <div style={{fontSize:12,color:C.smokeOrange}}>{d.fat}g</div>
                </div>
              );})}
            </div>
          </>}
        </div>}

        {tab==="workout"&&<WorkoutTab workoutPlans={workoutPlans} workoutLog={workoutLog} saveWorkoutPlans={saveWP} saveWorkoutLog={saveWL} showNotif={showNotif}/>}
        {tab==="profile"&&user&&<ProfileTab user={user} goals={goals} bmi={bmi} stepsPerm={stepsPerm} requestSteps={requestSteps} setGoals={setGoals} showNotif={showNotif}/>}
      </div>

      {/* Bottom Nav */}
      {!kbUp&&<div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,background:"rgba(250,248,242,0.96)",backdropFilter:"blur(16px)",borderTop:`1px solid ${C.border}`,display:"flex",padding:"8px 0 max(12px,env(safe-area-inset-bottom,12px))",zIndex:200,boxShadow:"0 -2px 20px rgba(74,124,89,0.08)"}}>
        {navItems.map(n=>(
          <button key={n.id} onClick={()=>switchTab(n.id)} style={{flex:1,background:"none",display:"flex",flexDirection:"column",alignItems:"center",gap:3,padding:"4px 0"}}>
            <span style={{fontSize:22,opacity:tab===n.id?1:.3,transition:"all .2s",transform:tab===n.id?"scale(1.15)":"scale(1)"}}>{n.icon}</span>
            <span style={{fontSize:9,fontWeight:700,letterSpacing:.3,color:tab===n.id?C.leaf:C.muted,transition:"color .2s"}}>{n.label}</span>
            {tab===n.id&&<div style={{width:18,height:2.5,background:C.leaf,borderRadius:2,marginTop:1}}/>}
          </button>
        ))}
      </div>}

      {/* ADD FOOD MODAL */}
      {addModal&&<div style={{position:"fixed",inset:0,background:"rgba(44,36,22,0.4)",zIndex:1000,display:"flex",alignItems:"flex-end",animation:"fadeIn .15s ease"}} onClick={e=>{if(e.target===e.currentTarget)closeModal();}}>
        <div style={{width:"100%",maxWidth:480,margin:"0 auto",background:C.surface,borderRadius:"24px 24px 0 0",display:"flex",flexDirection:"column",maxHeight:"93svh",boxShadow:"0 -8px 40px rgba(44,36,22,0.2)",animation:"slideUp .25s ease"}}>
          {/* Modal Header */}
          <div style={{padding:"16px 18px 12px",borderBottom:`1px solid ${C.border}`,flexShrink:0}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:800,color:C.text}}>
                {MEAL_TYPES.find(m=>m.id===addModal.mealType)?.emoji} {MEAL_TYPES.find(m=>m.id===addModal.mealType)?.label}
              </div>
              <button onClick={closeModal} style={{background:C.bg,border:`1px solid ${C.border}`,borderRadius:10,color:C.muted,padding:"5px 12px",fontSize:14}}>✕</button>
            </div>
            <div style={{display:"flex",gap:6,overflowX:"auto"}}>
              {[{id:"search",l:"🔍 Suche"},{id:"favorites",l:"⭐ Fav"},{id:"ai",l:"🤖 KI"},{id:"image",l:"📸 Foto"},{id:"barcode",l:"▦ Scan"}].map(m=>(
                <button key={m.id} onClick={()=>{if((m.id==="image"||m.id==="barcode")&&camPerm!=="granted"){requestCamera(m.id);return;}haptic("light");setAddMode(m.id);setAiResult(null);if(m.id==="barcode"&&camPerm==="granted")startScanner();else stopScanner();}} style={{flexShrink:0,padding:"8px 14px",borderRadius:10,fontSize:11,fontWeight:700,background:addMode===m.id?C.leaf:C.bg,color:addMode===m.id?"#fff":C.muted,border:`1.5px solid ${addMode===m.id?C.leaf:C.border}`,transition:"all .15s"}}>
                  {m.l}
                </button>
              ))}
            </div>
          </div>

          {/* Modal Body – keyboard-aware scroll */}
          <div ref={modalBodyRef} style={{overflowY:"auto",padding:"14px 18px 32px",flex:1,WebkitOverflowScrolling:"touch"}}>

            {/* SEARCH */}
            {addMode==="search"&&<div>
              <input
                ref={searchInputRef}
                autoFocus
                value={searchQ}
                onChange={e=>handleSearch(e.target.value)}
                placeholder="z.B. Cappuccino, Hühnchen, Reis…"
                style={sInput({marginBottom:12})}
                onFocus={()=>{
                  setTimeout(()=>{
                    searchInputRef.current?.scrollIntoView({behavior:"smooth",block:"start"});
                    modalBodyRef.current?.scrollTo({top:0,behavior:"smooth"});
                  },400);
                }}
              />
              {searchRes.map(food=>(
                <button key={food.name} onClick={()=>handleSelectFood(food)} style={{width:"100%",background:selFood?.name===food.name?C.leafSoft:C.bg,border:`1.5px solid ${selFood?.name===food.name?C.leaf:C.border}`,borderRadius:14,padding:"12px 16px",marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center",color:C.text,textAlign:"left",transition:"all .15s"}}>
                  <span style={{fontSize:13,fontWeight:600}}>{food.emoji} {food.name}</span>
                  <span style={{fontSize:11,color:C.muted,flexShrink:0,marginLeft:8}}>{food.calories} kcal/100g</span>
                </button>
              ))}
              {selFood&&(()=>{const n=calcN(selFood,grams);return(
                <div style={{background:C.leafSoft,borderRadius:16,padding:16,border:`1px solid ${C.borderStrong}`,marginTop:8,animation:"popIn .2s ease"}}>
                  <div style={{fontSize:15,fontWeight:700,marginBottom:14,color:C.text}}>{selFood.emoji} {selFood.name}</div>
                  <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
                    <label style={{fontSize:12,color:C.textSec,fontWeight:700,flexShrink:0}}>Menge (g):</label>
                    <input type="number" inputMode="decimal" value={grams} onChange={e=>setGrams(Number(e.target.value))} style={sInput({flex:1,fontWeight:700})}/>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:8,marginBottom:14}}>
                    {[{l:"Kcal",v:n.calories,c:C.leaf},{l:"Prot.",v:`${n.protein}g`,c:C.azalea},{l:"Carbs",v:`${n.carbs}g`,c:C.dandelion},{l:"Fett",v:`${n.fat}g`,c:C.smokeOrange}].map(s=>(
                      <div key={s.l} style={{background:C.surface,borderRadius:12,padding:"10px 6px",textAlign:"center",border:`1px solid ${C.border}`}}>
                        <div style={{fontSize:15,fontWeight:800,color:s.c}}>{s.v}</div>
                        <div style={{fontSize:9,color:C.muted,fontWeight:700,marginTop:2}}>{s.l}</div>
                      </div>
                    ))}
                  </div>
                  <button onClick={()=>addEntry({name:selFood.name,emoji:selFood.emoji,grams,mealType:addModal?.mealType||"snack",...n})} style={{width:"100%",padding:"14px",borderRadius:14,fontSize:15,fontWeight:700,background:`linear-gradient(135deg,${C.leaf},${C.moss})`,color:"#fff",border:"none",boxShadow:`0 4px 16px ${C.leaf}44`}}>✅ Hinzufügen</button>
                </div>
              );})()} 
            </div>}

            {/* FAVORITES */}
            {addMode==="favorites"&&<div>
              {topFavorites.length===0?(
                <div style={{textAlign:"center",padding:40,color:C.dim}}>
                  <div style={{fontSize:48,marginBottom:12}}>⭐</div>
                  <div style={{fontSize:15,fontWeight:700,color:C.textSec,marginBottom:6}}>Noch keine Favoriten</div>
                  <div style={{fontSize:12,color:C.muted}}>Deine häufig eingetragenen Mahlzeiten erscheinen hier automatisch</div>
                </div>
              ):topFavorites.map(fav=>(
                <div key={fav.key} style={{background:C.bg,borderRadius:14,padding:"12px 16px",marginBottom:8,border:`1.5px solid ${C.border}`,display:"flex",alignItems:"center",gap:12}}>
                  <span style={{fontSize:24}}>{fav.emoji}</span>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:13,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",color:C.text}}>{fav.name}</div>
                    <div style={{fontSize:10,color:C.muted,marginTop:1}}>{fav.grams}g · {fav.calories} kcal · {fav.count}×</div>
                  </div>
                  <button onClick={()=>addEntry({...fav,mealType:addModal?.mealType||"snack"})} style={{background:`linear-gradient(135deg,${C.leaf},${C.moss})`,border:"none",borderRadius:10,color:"#fff",padding:"9px 16px",fontSize:12,fontWeight:700,flexShrink:0}}>+ Add</button>
                </div>
              ))}
            </div>}

            {/* AI */}
            {addMode==="ai"&&<div>
              <div style={{background:C.dandelionSoft,borderRadius:12,padding:"10px 14px",marginBottom:12,border:`1px solid ${C.dandelion}44`,fontSize:12,color:C.textSec,lineHeight:1.5}}>
                🔑 Für die KI-Analyse wird ein Anthropic API-Key benötigt. Eintragen unter console.anthropic.com
              </div>
              <textarea value={aiInput} onChange={e=>setAiInput(e.target.value)} placeholder="z.B. 150g Hühnchenbrust, 50g Reis, 1 EL Olivenöl…" style={{...sInput(),minHeight:88,marginBottom:12}} onFocus={e=>setTimeout(()=>e.target.scrollIntoView({behavior:"smooth",block:"start"}),400)}/>
              <button onClick={handleAiAnalyze} disabled={aiLoading||!aiInput.trim()} style={{width:"100%",padding:"14px",borderRadius:14,fontSize:14,fontWeight:700,background:`linear-gradient(135deg,${C.leaf},${C.moss})`,color:"#fff",border:"none",opacity:!aiInput.trim()||aiLoading?.5:1,marginBottom:12}}>
                {aiLoading?"⏳ Analysiere…":"🤖 KI analysieren"}
              </button>
              {aiResult?.items&&<div>
                {aiResult.items.map((item,i)=>(
                  <div key={i} style={{background:C.bg,borderRadius:12,padding:"12px 14px",marginBottom:8,border:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between"}}>
                    <div><div style={{fontSize:13,fontWeight:600,color:C.text}}>{item.emoji} {item.name}</div><div style={{fontSize:10,color:C.muted,marginTop:1}}>{item.grams}g</div></div>
                    <div style={{textAlign:"right"}}><div style={{fontSize:13,fontWeight:800,color:C.leaf}}>{item.calories} kcal</div><div style={{fontSize:10,color:C.azalea,fontWeight:700}}>{item.protein}g P</div></div>
                  </div>
                ))}
                <button onClick={handleAddAiResult} style={{width:"100%",padding:"14px",borderRadius:14,fontSize:14,fontWeight:700,background:`linear-gradient(135deg,${C.leaf},${C.moss})`,color:"#fff",border:"none"}}>✅ Alle hinzufügen</button>
              </div>}
            </div>}

            {/* IMAGE */}
            {addMode==="image"&&<div>
              <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={e=>{const f=e.target.files[0];if(!f)return;setImgFile(f);const r=new FileReader();r.onload=ev=>setImgPreview(ev.target.result);r.readAsDataURL(f);}} style={{display:"none"}}/>
              {!imgPreview?(
                <button onClick={()=>{if(camPerm!=="granted"){requestCamera("image");return;}fileRef.current.click();}} style={{width:"100%",background:C.bg,border:`2px dashed ${C.border}`,borderRadius:18,padding:"44px 20px",color:C.muted,fontSize:13,display:"flex",flexDirection:"column",alignItems:"center",gap:10,marginBottom:12}}>
                  <span style={{fontSize:52}}>📸</span>
                  <span>Foto aufnehmen oder auswählen</span>
                </button>
              ):<div style={{marginBottom:12}}>
                <img src={imgPreview} alt="meal" style={{width:"100%",borderRadius:16,maxHeight:210,objectFit:"cover",border:`1px solid ${C.border}`,display:"block"}}/>
                <button onClick={()=>{setImgFile(null);setImgPreview(null);setAiResult(null);}} style={{marginTop:8,background:C.bg,border:`1px solid ${C.border}`,borderRadius:10,color:C.textSec,padding:"6px 14px",fontSize:12}}>Anderes Bild</button>
              </div>}
              {imgFile&&<button onClick={handleImgAnalyze} disabled={aiLoading} style={{width:"100%",padding:"14px",borderRadius:14,fontSize:14,fontWeight:700,background:`linear-gradient(135deg,${C.azalea},${C.smokeOrange})`,color:"#fff",border:"none",marginBottom:12}}>
                {aiLoading?"⏳ Erkenne Mahlzeit…":"🔍 Mahlzeit erkennen"}
              </button>}
              {aiResult?.items&&<div>
                {aiResult.items.map((item,i)=><div key={i} style={{background:C.bg,borderRadius:12,padding:"12px 14px",marginBottom:8,border:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between"}}><div><div style={{fontSize:13,fontWeight:600,color:C.text}}>{item.emoji} {item.name}</div><div style={{fontSize:10,color:C.muted}}>~{item.grams}g</div></div><div style={{textAlign:"right"}}><div style={{fontSize:13,fontWeight:800,color:C.leaf}}>{item.calories} kcal</div><div style={{fontSize:10,color:C.azalea,fontWeight:700}}>{item.protein}g P</div></div></div>)}
                <button onClick={handleAddAiResult} style={{width:"100%",padding:"14px",borderRadius:14,fontSize:14,fontWeight:700,background:`linear-gradient(135deg,${C.leaf},${C.moss})`,color:"#fff",border:"none"}}>✅ Hinzufügen</button>
              </div>}
            </div>}

            {/* BARCODE */}
            {addMode==="barcode"&&<div>
              <div style={{position:"relative",borderRadius:18,overflow:"hidden",background:"#111",marginBottom:14,aspectRatio:"4/3",maxHeight:"44svh"}}>
                <video ref={videoRef} style={{width:"100%",height:"100%",objectFit:"cover",display:scanning?"block":"none"}} playsInline muted autoPlay/>
                <canvas ref={canvasRef} style={{display:"none"}}/>
                {scanning&&<>
                  <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",pointerEvents:"none"}}>
                    {[["top","left"],["top","right"],["bottom","left"],["bottom","right"]].map(([v,h],i)=>(
                      <div key={i} style={{position:"absolute",width:30,height:30,[v]:20,[h]:20,borderTop:v==="top"?`3px solid ${C.leaf}`:"none",borderBottom:v==="bottom"?`3px solid ${C.leaf}`:"none",borderLeft:h==="left"?`3px solid ${C.leaf}`:"none",borderRight:h==="right"?`3px solid ${C.leaf}`:"none",borderRadius:3}}/>
                    ))}
                    <div style={{width:"65%",height:2,background:`linear-gradient(90deg,transparent,${C.sage},transparent)`,animation:"scanLine 1.8s ease-in-out infinite"}}/>
                  </div>
                  <div style={{position:"absolute",bottom:12,left:0,right:0,textAlign:"center"}}><span style={{background:"rgba(0,0,0,.6)",color:"#fff",fontSize:11,fontWeight:700,padding:"5px 14px",borderRadius:20}}>EAN / GTIN in den Rahmen halten</span></div>
                </>}
                {!scanning&&!aiLoading&&!aiResult&&<div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}><div style={{fontSize:52,marginBottom:8}}>▦</div><div style={{fontSize:13,color:"#888"}}>Scanner bereit</div></div>}
                {aiLoading&&<div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"#111"}}><div style={{fontSize:36,marginBottom:8,animation:"pulse 1s infinite"}}>🔍</div><div style={{fontSize:13,color:C.sage,fontWeight:700}}>Produkt wird gesucht…</div>{scannedCode&&<div style={{fontSize:10,color:"#888",marginTop:4}}>GTIN: {scannedCode}</div>}</div>}
              </div>
              <div style={{display:"flex",gap:10,marginBottom:14}}>
                {!scanning?<button onClick={startScanner} style={{flex:1,padding:"13px",borderRadius:14,fontSize:14,fontWeight:700,background:`linear-gradient(135deg,${C.leaf},${C.moss})`,color:"#fff",border:"none"}}>📷 Scanner starten</button>:<button onClick={stopScanner} style={{flex:1,padding:"13px",borderRadius:14,fontSize:14,fontWeight:700,background:"#fff0f0",color:"#c0392b",border:"1.5px solid #f5b8b8"}}>⏹ Stoppen</button>}
              </div>
              <div style={{background:C.bg,borderRadius:14,padding:"14px 16px",border:`1px solid ${C.border}`,marginBottom:14}}>
                <div style={{fontSize:10,color:C.muted,fontWeight:700,marginBottom:10,letterSpacing:.5,textTransform:"uppercase"}}>Oder GTIN / EAN manuell</div>
                <div style={{display:"flex",gap:8}}>
                  <input ref={barcodeInputRef} type="number" inputMode="numeric" placeholder="z.B. 4008400401805" style={sInput({flex:1})} onKeyDown={e=>{if(e.key==="Enter"&&barcodeInputRef.current?.value?.length>=6){setScannedCode(barcodeInputRef.current.value);lookupGTIN(barcodeInputRef.current.value);}}}/>
                  <button onClick={()=>{if(barcodeInputRef.current?.value?.length>=6){setScannedCode(barcodeInputRef.current.value);lookupGTIN(barcodeInputRef.current.value);}}} style={{background:C.leafSoft,border:`1px solid ${C.leaf}44`,borderRadius:12,color:C.leaf,padding:"0 16px",fontSize:13,fontWeight:700,flexShrink:0}}>Suchen</button>
                </div>
              </div>
              {aiResult?.items&&!aiLoading&&<div>
                {aiResult.items.map((item,i)=>(
                  <div key={i} style={{background:C.leafSoft,borderRadius:14,padding:"14px 16px",marginBottom:10,border:`1px solid ${C.borderStrong}`}}>
                    <div style={{fontSize:15,fontWeight:700,color:C.text,marginBottom:6}}>{item.emoji} {item.name}</div>
                    <div style={{display:"flex",gap:14,flexWrap:"wrap"}}>{[{l:"Kcal",v:item.calories,c:C.leaf},{l:"Prot.",v:`${item.protein}g`,c:C.azalea},{l:"Carbs",v:`${item.carbs||0}g`,c:C.dandelion},{l:"Fett",v:`${item.fat||0}g`,c:C.smokeOrange}].map(s=><span key={s.l} style={{fontSize:11,fontWeight:700,color:s.c}}>{s.l} {s.v}</span>)}</div>
                  </div>
                ))}
                <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
                  <label style={{fontSize:12,color:C.textSec,fontWeight:700,flexShrink:0}}>Menge (g):</label>
                  <input type="number" inputMode="decimal" value={grams} onChange={e=>setGrams(Number(e.target.value))} style={sInput({flex:1,fontWeight:700})}/>
                </div>
                <button onClick={()=>{const item=aiResult.items[0];if(!item)return;const r=grams/100;addEntry({name:item.name,emoji:item.emoji||"🏪",grams,mealType:addModal?.mealType||"snack",calories:Math.round(item.calories*r),protein:+(item.protein*r).toFixed(1),carbs:+((item.carbs||0)*r).toFixed(1),fat:+((item.fat||0)*r).toFixed(1)});}} style={{width:"100%",padding:"14px",borderRadius:14,fontSize:15,fontWeight:700,background:`linear-gradient(135deg,${C.leaf},${C.moss})`,color:"#fff",border:"none",boxShadow:`0 4px 16px ${C.leaf}44`}}>✅ Hinzufügen</button>
              </div>}
            </div>}
          </div>
        </div>
      </div>}

      {/* CAMERA MODAL */}
      {camModal&&<div style={{position:"fixed",inset:0,background:"rgba(44,36,22,0.45)",zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center",padding:24,animation:"fadeIn .15s ease"}}>
        <div style={{background:C.surface,borderRadius:24,padding:28,width:"100%",maxWidth:340,boxShadow:C.shadowLg,textAlign:"center",animation:"popIn .22s ease",border:`1px solid ${C.border}`}}>
          <div style={{fontSize:52,marginBottom:14}}>📷</div>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:800,color:C.text,marginBottom:10}}>Kamerazugriff</div>
          <div style={{fontSize:13,color:C.textSec,lineHeight:1.7,marginBottom:24}}>
            TrackadenZ möchte deine Kamera nutzen, um {pendingCam==="barcode"?"Barcodes zu scannen.":"Mahlzeiten zu fotografieren."}
            <br/><span style={{fontSize:11,color:C.muted}}>Nur einmalige Abfrage.</span>
          </div>
          <button onClick={grantCamera} style={{width:"100%",padding:"14px",borderRadius:14,fontSize:15,fontWeight:700,background:`linear-gradient(135deg,${C.leaf},${C.moss})`,color:"#fff",border:"none",marginBottom:10,boxShadow:`0 4px 16px ${C.leaf}44`}}>📷 Zugriff erlauben</button>
          <button onClick={denyCamera} style={{width:"100%",padding:"13px",borderRadius:14,fontSize:14,fontWeight:700,background:C.surface,color:C.textSec,border:`1.5px solid ${C.border}`}}>Nicht jetzt</button>
        </div>
      </div>}
    </div>
  );
}

// ─── WORKOUT TAB ──────────────────────────────────────────────────────────────
function WorkoutTab({workoutPlans,workoutLog,saveWorkoutPlans,saveWorkoutLog,showNotif}){
  const[view,setView]=useState("plans");
  const[sel,setSel]=useState(null);
  const[newPlan,setNewPlan]=useState({name:"",days:[{name:"Tag A",exercises:[]}]});
  const[newEx,setNewEx]=useState({name:"",sets:3,reps:"8–12",weight:"",note:"",emoji:"🏋️"});
  const[dayIdx,setDayIdx]=useState(0);
  const[sw,setSw]=useState({});
  const emos=["🏋️","💪","🦵","🔥","⚡","🎯","🤸","🏃","🚴","🧗","🥊","🤼"];
  const iS={width:"100%",background:"#f5f0e8",border:`1.5px solid #d4c9a8`,borderRadius:12,padding:"11px 14px",color:"#2c2416",fontSize:16,marginBottom:10,fontFamily:"'DM Sans',sans-serif"};
  const C2={leaf:"#4a7c59",leafSoft:"#e8f0e9",border:"#d4c9a8",text:"#2c2416",muted:"#8c7d65",surface:"#faf8f2",bg:"#f5f0e8",accent:"#4a7c59",accentSoft:"#e8f0e9",shadow:"0 2px 16px rgba(74,124,89,0.10)"};

  const createPlan=()=>{if(!newPlan.name.trim())return;saveWorkoutPlans([...workoutPlans,{...newPlan,id:Date.now(),createdAt:new Date().toISOString()}]);setView("plans");setNewPlan({name:"",days:[{name:"Tag A",exercises:[]}]});showNotif("✅ Plan erstellt!");};
  const delPlan=id=>{saveWorkoutPlans(workoutPlans.filter(p=>p.id!==id));showNotif("🗑️ Gelöscht","err");};
  const addEx=()=>{if(!newEx.name.trim())return;const p=JSON.parse(JSON.stringify(sel));p.days[dayIdx].exercises=[...(p.days[dayIdx].exercises||[]),{...newEx,id:Date.now()}];saveWorkoutPlans(workoutPlans.map(wp=>wp.id===p.id?p:wp));setSel(p);setNewEx({name:"",sets:3,reps:"8–12",weight:"",note:"",emoji:"🏋️"});showNotif("✅ Übung hinzugefügt!");};
  const remEx=(di,eid)=>{const p=JSON.parse(JSON.stringify(sel));p.days[di].exercises=p.days[di].exercises.filter(e=>e.id!==eid);saveWorkoutPlans(workoutPlans.map(wp=>wp.id===p.id?p:wp));setSel(p);};
  const logSession=()=>{const today=new Date().toDateString();const entry={planId:sel.id,planName:sel.name,dayName:sel.days[dayIdx].name,exercises:(sel.days[dayIdx].exercises||[]).map(ex=>({...ex,weight:sw[ex.id]||ex.weight||"–"})),date:today,timestamp:Date.now()};const wl={...workoutLog};if(!wl[today])wl[today]=[];wl[today].push(entry);saveWorkoutLog(wl);setSw({});showNotif("🎉 Training gespeichert!");setView("plans");};
  const last14=Array.from({length:14},(_,i)=>{const d=new Date();d.setDate(d.getDate()-(13-i));const key=d.toDateString();return{label:d.toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit"}),count:(workoutLog[key]||[]).length};});
  const maxC=Math.max(1,...last14.map(d=>d.count));
  const card={background:"#faf8f2",borderRadius:18,padding:"14px 16px",border:`1px solid #d4c9a8`,boxShadow:"0 2px 16px rgba(74,124,89,0.10)",marginBottom:12};

  const backBtn=<button onClick={()=>{setView("plans");setSel(null);}} style={{background:C2.bg,border:`1px solid ${C2.border}`,borderRadius:10,color:C2.muted,padding:"7px 14px",fontSize:13}}>← Zurück</button>;

  if(view==="create")return<div>
    <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>{backBtn}<div style={{fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:800,color:C2.text}}>Neuer Plan</div></div>
    <input style={iS} placeholder="Planname (z.B. Push/Pull/Legs)" value={newPlan.name} onChange={e=>setNewPlan(p=>({...p,name:e.target.value}))} autoFocus/>
    <div style={{fontSize:10,color:C2.muted,fontWeight:700,marginBottom:10,textTransform:"uppercase",letterSpacing:.5}}>Trainingstage</div>
    {newPlan.days.map((day,di)=><div key={di} style={{display:"flex",gap:8,marginBottom:8}}><input style={{...iS,flex:1,marginBottom:0}} value={day.name} onChange={e=>{const days=[...newPlan.days];days[di].name=e.target.value;setNewPlan(p=>({...p,days}));}} placeholder={`Tag ${di+1}`}/>{newPlan.days.length>1&&<button onClick={()=>setNewPlan(p=>({...p,days:p.days.filter((_,i)=>i!==di)}))} style={{background:"#fff0f0",border:`1px solid #f5b8b8`,borderRadius:10,color:"#c0392b",padding:"0 12px",fontSize:14}}>✕</button>}</div>)}
    <button onClick={()=>setNewPlan(p=>({...p,days:[...p.days,{name:`Tag ${p.days.length+1}`,exercises:[]}]}))} style={{width:"100%",background:C2.bg,border:`1.5px dashed ${C2.border}`,borderRadius:12,color:C2.muted,padding:12,fontSize:13,marginBottom:16}}>+ Tag hinzufügen</button>
    <button onClick={createPlan} disabled={!newPlan.name.trim()} style={{width:"100%",background:`linear-gradient(135deg,${C2.leaf},#3d6b4a)`,borderRadius:14,padding:14,color:"#fff",fontSize:15,fontWeight:700,border:"none",opacity:!newPlan.name.trim()?.5:1}}>✅ Plan erstellen</button>
  </div>;

  if(view==="detail"&&sel)return<div>
    <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>{backBtn}<div style={{fontFamily:"'Playfair Display',serif",fontSize:15,fontWeight:800,flex:1,color:C2.text}}>{sel.name}</div><button onClick={()=>setView("logSession")} style={{background:C2.leafSoft,border:`1px solid ${C2.leaf}44`,borderRadius:10,color:C2.leaf,padding:"7px 14px",fontSize:12,fontWeight:700}}>▶ Start</button></div>
    <div style={{display:"flex",gap:7,marginBottom:14,overflowX:"auto"}}>{sel.days.map((day,i)=><button key={i} onClick={()=>setDayIdx(i)} style={{flexShrink:0,padding:"7px 16px",borderRadius:10,fontSize:12,fontWeight:700,background:dayIdx===i?C2.leaf:C2.bg,color:dayIdx===i?"#fff":C2.muted,border:`1.5px solid ${dayIdx===i?C2.leaf:C2.border}`}}>{day.name}</button>)}</div>
    {(sel.days[dayIdx].exercises||[]).map(ex=><div key={ex.id} style={{...card,display:"flex",alignItems:"center",gap:12}}>
      <span style={{fontSize:24}}>{ex.emoji}</span><div style={{flex:1}}><div style={{fontSize:13,fontWeight:700,color:C2.text}}>{ex.name}</div><div style={{fontSize:11,color:C2.muted,marginTop:1}}>{ex.sets} Sätze × {ex.reps}{ex.weight?` · ${ex.weight}kg`:""}</div>{ex.note&&<div style={{fontSize:10,color:C2.muted,marginTop:2,opacity:.7}}>{ex.note}</div>}</div>
      <button onClick={()=>remEx(dayIdx,ex.id)} style={{background:"none",color:C2.muted,fontSize:16,padding:4}}>✕</button>
    </div>)}
    <div style={{background:C2.bg,borderRadius:16,padding:16,border:`1.5px dashed ${C2.border}`,marginTop:4}}>
      <div style={{fontSize:10,color:C2.muted,fontWeight:700,marginBottom:12,textTransform:"uppercase",letterSpacing:.5}}>+ Übung hinzufügen</div>
      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>{emos.map(em=><button key={em} onClick={()=>setNewEx(e=>({...e,emoji:em}))} style={{background:newEx.emoji===em?C2.leafSoft:C2.surface,border:`1.5px solid ${newEx.emoji===em?C2.leaf:C2.border}`,borderRadius:8,padding:"6px 9px",fontSize:20}}>{em}</button>)}</div>
      <input style={iS} placeholder="Übungsname (z.B. Bankdrücken)" value={newEx.name} onChange={e=>setNewEx(x=>({...x,name:e.target.value}))}/>
      <div style={{display:"flex",gap:8,marginBottom:2}}>
        <div style={{flex:1}}><div style={{fontSize:10,color:C2.muted,fontWeight:700,marginBottom:4,textTransform:"uppercase",letterSpacing:.4}}>Sätze</div><input type="number" style={iS} value={newEx.sets} onChange={e=>setNewEx(x=>({...x,sets:Number(e.target.value)}))}/></div>
        <div style={{flex:1}}><div style={{fontSize:10,color:C2.muted,fontWeight:700,marginBottom:4,textTransform:"uppercase",letterSpacing:.4}}>Wiederh.</div><input style={iS} value={newEx.reps} onChange={e=>setNewEx(x=>({...x,reps:e.target.value}))} placeholder="z.B. 8–12"/></div>
        <div style={{flex:1}}><div style={{fontSize:10,color:C2.muted,fontWeight:700,marginBottom:4,textTransform:"uppercase",letterSpacing:.4}}>KG</div><input type="number" style={iS} value={newEx.weight} onChange={e=>setNewEx(x=>({...x,weight:e.target.value}))} placeholder="Opt."/></div>
      </div>
      <input style={iS} placeholder="Notiz (optional)" value={newEx.note} onChange={e=>setNewEx(x=>({...x,note:e.target.value}))}/>
      <button onClick={addEx} disabled={!newEx.name.trim()} style={{width:"100%",background:`linear-gradient(135deg,${C2.leaf},#3d6b4a)`,borderRadius:12,padding:13,color:"#fff",fontSize:14,fontWeight:700,border:"none",opacity:!newEx.name.trim()?.5:1}}>+ Übung hinzufügen</button>
    </div>
  </div>;

  if(view==="logSession"&&sel){
    const dayEx=sel.days[dayIdx].exercises||[];
    return<div>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}><button onClick={()=>setView("detail")} style={{background:C2.bg,border:`1px solid ${C2.border}`,borderRadius:10,color:C2.muted,padding:"7px 14px",fontSize:13}}>← Zurück</button><div style={{fontFamily:"'Playfair Display',serif",fontSize:15,fontWeight:800,color:C2.text}}>🏋️ Training</div></div>
      <div style={{...card,background:C2.leafSoft,border:`1px solid ${C2.leaf}44`}}><div style={{fontWeight:700,fontSize:15,color:C2.text}}>{sel.name} · {sel.days[dayIdx].name}</div><div style={{fontSize:11,color:C2.muted,marginTop:2}}>{dayEx.length} Übungen</div></div>
      {dayEx.map(ex=><div key={ex.id} style={card}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}><span style={{fontSize:24}}>{ex.emoji}</span><div style={{flex:1}}><div style={{fontSize:13,fontWeight:700,color:C2.text}}>{ex.name}</div><div style={{fontSize:11,color:C2.muted}}>{ex.sets} × {ex.reps}</div></div></div>
        <div style={{display:"flex",alignItems:"center",gap:10}}><label style={{fontSize:12,color:C2.muted,fontWeight:700,flexShrink:0}}>Gewicht (kg):</label><input type="number" inputMode="decimal" value={sw[ex.id]||ex.weight||""} onChange={e=>setSw(w=>({...w,[ex.id]:e.target.value}))} placeholder={ex.weight||"kg"} style={{flex:1,background:C2.bg,border:`1.5px solid ${C2.border}`,borderRadius:10,padding:"10px 14px",color:C2.text,fontSize:16,fontWeight:700,fontFamily:"inherit"}}/></div>
      </div>)}
      <button onClick={logSession} style={{width:"100%",background:`linear-gradient(135deg,${C2.leaf},#5c8f5a)`,borderRadius:14,padding:14,color:"#fff",fontSize:15,fontWeight:700,border:"none",marginTop:4,boxShadow:`0 4px 16px ${C2.leaf}44`}}>🎉 Training abschließen</button>
    </div>;
  }

  return<div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
      <div style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:800,color:C2.text}}>🏋️ Training</div>
      <button onClick={()=>setView("create")} style={{background:C2.leafSoft,border:`1px solid ${C2.leaf}44`,borderRadius:10,color:C2.leaf,padding:"8px 16px",fontSize:12,fontWeight:700}}>+ Neuer Plan</button>
    </div>
    {Object.keys(workoutLog).length>0&&<div style={card}>
      <div style={{fontSize:10,color:C2.muted,fontWeight:700,letterSpacing:.5,marginBottom:12,textTransform:"uppercase"}}>Training letzte 14 Tage</div>
      <div style={{display:"flex",alignItems:"flex-end",gap:3,height:52}}>{last14.map((d,i)=><div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}><div style={{width:"100%",borderRadius:"3px 3px 0 0",background:d.count>0?C2.leaf:C2.border,height:`${(d.count/maxC)*44+(d.count>0?8:0)}px`,minHeight:4,transition:"height .4s"}}/>{i%4===0&&<div style={{fontSize:8,color:C2.muted}}>{d.label.split(".")[0]}</div>}</div>)}</div>
    </div>}
    {workoutPlans.length===0?(
      <div style={{...card,textAlign:"center",padding:40,border:`1.5px dashed ${C2.border}`}}><div style={{fontSize:44,marginBottom:10}}>🏋️</div><div style={{color:C2.muted}}>Erstelle deinen ersten Plan</div></div>
    ):workoutPlans.map(plan=><div key={plan.id} style={card}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <div style={{flex:1,cursor:"pointer",minWidth:0}} onClick={()=>{setSel(plan);setDayIdx(0);setView("detail");}}>
          <div style={{fontSize:14,fontWeight:700,color:C2.text}}>{plan.name}</div>
          <div style={{fontSize:11,color:C2.muted,marginTop:2}}>{plan.days.length} Tage · {plan.days.reduce((s,d)=>s+(d.exercises||[]).length,0)} Übungen</div>
          <div style={{display:"flex",gap:5,marginTop:8,flexWrap:"wrap"}}>{plan.days.map((d,i)=><span key={i} style={{background:C2.bg,borderRadius:6,padding:"2px 9px",fontSize:10,color:C2.muted,border:`1px solid ${C2.border}`,fontWeight:600}}>{d.name}</span>)}</div>
        </div>
        <div style={{display:"flex",gap:8,marginLeft:10,flexShrink:0}}>
          <button onClick={()=>{setSel(plan);setDayIdx(0);setView("detail");}} style={{background:C2.leafSoft,border:`1px solid ${C2.leaf}44`,borderRadius:9,color:C2.leaf,padding:"7px 12px",fontSize:11,fontWeight:700}}>Öffnen</button>
          <button onClick={()=>delPlan(plan.id)} style={{background:"#fff0f0",border:`1px solid #f5b8b8`,borderRadius:9,color:"#c0392b",padding:"7px 10px",fontSize:14}}>🗑️</button>
        </div>
      </div>
    </div>)}
    {Object.keys(workoutLog).length>0&&<div style={{marginTop:16}}>
      <div style={{fontSize:10,color:C2.muted,fontWeight:700,letterSpacing:.5,marginBottom:10,textTransform:"uppercase"}}>Letzte Einheiten</div>
      {Object.entries(workoutLog).sort((a,b)=>new Date(b[0])-new Date(a[0])).slice(0,4).flatMap(([dk,sessions])=>sessions.map((s,i)=><div key={`${dk}-${i}`} style={{...card,display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><div style={{fontSize:13,fontWeight:700,color:C2.text}}>{s.planName} · {s.dayName}</div><div style={{fontSize:11,color:C2.muted,marginTop:2}}>{dk===new Date().toDateString()?"Heute":new Date(dk).toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit"})} · {s.exercises.length} Übungen</div></div><span style={{fontSize:20}}>✅</span></div>))}
    </div>}
  </div>;
}

// ─── PROFILE TAB ─────────────────────────────────────────────────────────────
function ProfileTab({user,goals,bmi,stepsPerm,requestSteps,setGoals,showNotif}){
  const[editG,setEditG]=useState(goals);
  const[gOpen,setGOpen]=useState(false);
  const bmiCat=bmi<18.5?"Untergewicht":bmi<25?"Normalgewicht ✓":bmi<30?"Übergewicht":"Adipositas";
  const save=()=>{setGoals(editG);lsSet(K.GOALS,editG);setGOpen(false);showNotif("🎯 Ziele gespeichert!");};
  const card={background:"#faf8f2",borderRadius:18,padding:"14px 16px",border:`1px solid #d4c9a8`,boxShadow:"0 2px 16px rgba(74,124,89,0.10)",marginBottom:12};
  return<div>
    <div style={{...card,background:`linear-gradient(135deg,#e8f0e9,#faf2db)`,border:`1px solid #b8a878`,textAlign:"center",padding:"28px 20px"}}>
      <div style={{width:64,height:64,borderRadius:"50%",background:`linear-gradient(135deg,#4a7c59,#5c7a4e)`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px",fontFamily:"'Playfair Display',serif",fontWeight:800,fontSize:26,color:"#fff",boxShadow:`0 4px 16px #4a7c5944`}}>{user.name?.[0]?.toUpperCase()}</div>
      <div style={{fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:800,color:"#2c2416"}}>{user.name}</div>
      <div style={{fontSize:12,color:"#8c7d65",marginTop:3}}>{user.gender==="male"?"Männlich":"Weiblich"} · {user.age} Jahre</div>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:10}}>
      {[{l:"Gewicht",v:`${user.weight}kg`,c:"#4a7c59"},{l:"Größe",v:`${user.height}cm`,c:"#d4784a"},{l:"BMI",v:bmi,c:bmi<25?"#5c7a4e":"#c9a227"}].map(s=><div key={s.l} style={{...card,textAlign:"center",marginBottom:0}}>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:19,fontWeight:800,color:s.c}}>{s.v}</div>
        <div style={{fontSize:10,color:"#8c7d65",marginTop:2,fontWeight:700}}>{s.l}</div>
      </div>)}
    </div>
    <div style={{fontSize:11,color:"#8c7d65",textAlign:"center",marginBottom:12}}>BMI-Kategorie: <strong style={{color:"#2c2416"}}>{bmiCat}</strong></div>
    <div style={card}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}><div style={{fontSize:10,color:"#8c7d65",fontWeight:700,textTransform:"uppercase",letterSpacing:.5}}>Tagesziele</div><button onClick={()=>{setEditG(goals);setGOpen(g=>!g);}} style={{background:"#e8f0e9",border:`1px solid #4a7c5944`,borderRadius:8,color:"#4a7c59",padding:"5px 12px",fontSize:11,fontWeight:700}}>Bearbeiten</button></div>
      {[{l:"Kalorien",v:`${goals.calories} kcal`,c:"#4a7c59"},{l:"Protein",v:`${goals.protein}g`,c:"#c9607a"}].map(r=><div key={r.l} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid #d4c9a8`}}><span style={{fontSize:13,color:"#5c4f38"}}>{r.l}</span><span style={{fontSize:14,fontWeight:800,color:r.c}}>{r.v}</span></div>)}
      {gOpen&&<div style={{marginTop:14}}>
        {[{key:"calories",l:"Kalorien (kcal)"},{key:"protein",l:"Protein (g)"}].map(f=><div key={f.key} style={{marginBottom:12}}><div style={{fontSize:11,color:"#8c7d65",fontWeight:700,marginBottom:6,textTransform:"uppercase",letterSpacing:.4}}>{f.l}</div><input type="number" inputMode="decimal" value={editG[f.key]} onChange={e=>setEditG(g=>({...g,[f.key]:Number(e.target.value)}))} style={{width:"100%",background:"#f5f0e8",border:`1.5px solid #d4c9a8`,borderRadius:12,padding:"11px 14px",color:"#2c2416",fontSize:16,fontWeight:700,fontFamily:"inherit"}}/></div>)}
        <button onClick={save} style={{width:"100%",background:`linear-gradient(135deg,#4a7c59,#5c7a4e)`,borderRadius:12,padding:13,color:"#fff",fontSize:14,fontWeight:700,border:"none"}}>💾 Speichern</button>
      </div>}
    </div>
    <div style={card}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><div style={{fontSize:13,fontWeight:700,color:"#2c2416"}}>👟 Schrittzähler</div><div style={{fontSize:11,color:"#8c7d65",marginTop:1}}>{stepsPerm==="granted"?"✅ Aktiviert":"Nicht aktiviert"}</div></div>{stepsPerm!=="granted"&&<button onClick={requestSteps} style={{background:"#faeee6",border:`1px solid #d4784a44`,borderRadius:9,color:"#d4784a",padding:"7px 14px",fontSize:12,fontWeight:700}}>Aktivieren</button>}</div>
    </div>
    <div style={{...card,marginBottom:28}}>
      <div style={{fontSize:10,color:"#8c7d65",fontWeight:700,marginBottom:8,textTransform:"uppercase",letterSpacing:.5}}>Account</div>
      <div style={{fontSize:12,color:"#8c7d65"}}>Mitglied seit</div>
      <div style={{fontSize:14,fontWeight:700,color:"#2c2416",marginTop:3}}>{new Date(user.createdAt).toLocaleDateString("de-DE",{day:"numeric",month:"long",year:"numeric"})}</div>
    </div>
  </div>;
}
