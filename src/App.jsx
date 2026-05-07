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
const LOGO_SRC = "data:image/png;base64,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";

function TZIcon({size=48}){
  return(
    <img
      src={LOGO_SRC}
      width={size}
      height={size}
      alt="TrackadenZ"
      style={{borderRadius: size*0.22, display:"block", flexShrink:0}}
    />
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
  const[viewportH,setViewportH]=useState(typeof window!=="undefined"?window.innerHeight:800);
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

  // Keyboard detection – track exact viewport height for modal positioning
  useEffect(()=>{
    const onResize=()=>{
      const h = window.visualViewport ? window.visualViewport.height : window.innerHeight;
      setViewportH(h);
      setKbUp(h < window.screen.height * 0.75);
    };
    window.visualViewport?.addEventListener("resize", onResize);
    window.addEventListener("resize", onResize);
    return()=>{
      window.visualViewport?.removeEventListener("resize", onResize);
      window.removeEventListener("resize", onResize);
    };
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
        {tab==="profile"&&user&&<ProfileTab user={user} setUser={setUser} goals={goals} bmi={bmi} stepsPerm={stepsPerm} requestSteps={requestSteps} setGoals={setGoals} showNotif={showNotif}/>}
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

      {/* ADD FOOD MODAL – fixed to visible viewport so search stays above keyboard */}
      {addModal&&<div
        style={{position:"fixed",top:0,left:0,right:0,zIndex:1000,
          height:viewportH,display:"flex",flexDirection:"column",
          background:"rgba(44,36,22,0.45)",animation:"fadeIn .15s ease"}}
        onClick={e=>{if(e.target===e.currentTarget)closeModal();}}
      >
        {/* Tap-to-close area at top */}
        <div onClick={closeModal} style={{flex:1,minHeight:kbUp?8:60}}/>

        {/* Modal panel – always fills bottom portion of visible viewport */}
        <div style={{
          width:"100%",maxWidth:480,margin:"0 auto",
          background:C.surface,
          borderRadius:kbUp?"16px 16px 0 0":"24px 24px 0 0",
          display:"flex",flexDirection:"column",
          height:kbUp?"auto":"auto",
          maxHeight:kbUp?viewportH-8:viewportH*0.92,
          boxShadow:"0 -8px 40px rgba(44,36,22,0.25)",
          animation:"slideUp .22s ease",
        }}>
          {/* ── STICKY HEADER with search pinned inside ── */}
          <div style={{flexShrink:0,padding:"14px 16px 10px",borderBottom:`1px solid ${C.border}`}}>
            {/* Title row */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:15,fontWeight:800,color:C.text}}>
                {MEAL_TYPES.find(m=>m.id===addModal.mealType)?.emoji} {MEAL_TYPES.find(m=>m.id===addModal.mealType)?.label}
              </div>
              <button onClick={closeModal} style={{background:C.bg,border:`1px solid ${C.border}`,borderRadius:10,color:C.muted,padding:"5px 12px",fontSize:14,lineHeight:1}}>✕</button>
            </div>
            {/* Mode tabs */}
            <div style={{display:"flex",gap:6,overflowX:"auto",marginBottom:addMode==="search"?10:0}}>
              {[{id:"search",l:"🔍 Suche"},{id:"favorites",l:"⭐ Fav"},{id:"ai",l:"🤖 KI"},{id:"image",l:"📸 Foto"},{id:"barcode",l:"▦ Scan"}].map(m=>(
                <button key={m.id} onClick={()=>{
                  if((m.id==="image"||m.id==="barcode")&&camPerm!=="granted"){requestCamera(m.id);return;}
                  haptic("light");setAddMode(m.id);setAiResult(null);
                  if(m.id==="barcode"&&camPerm==="granted")startScanner();else stopScanner();
                }} style={{flexShrink:0,padding:"7px 12px",borderRadius:10,fontSize:11,fontWeight:700,
                  background:addMode===m.id?C.leaf:C.bg,
                  color:addMode===m.id?"#fff":C.muted,
                  border:`1.5px solid ${addMode===m.id?C.leaf:C.border}`,
                  transition:"all .15s"}}>
                  {m.l}
                </button>
              ))}
            </div>
            {/* Search input always visible in header when in search mode */}
            {addMode==="search"&&(
              <input
                ref={searchInputRef}
                autoFocus
                value={searchQ}
                onChange={e=>handleSearch(e.target.value)}
                placeholder="z.B. Cappuccino, Hühnchen, Reis…"
                style={sInput({marginBottom:0})}
              />
            )}
          </div>

          {/* ── SCROLLABLE BODY ── */}
          <div ref={modalBodyRef} style={{overflowY:"auto",padding:"12px 16px 28px",flex:1,WebkitOverflowScrolling:"touch"}}>

            {/* SEARCH RESULTS */}
            {addMode==="search"&&<div>
              {!searchQ&&!selFood&&(
                <div style={{textAlign:"center",padding:"20px 0",color:C.muted}}>
                  <div style={{fontSize:32,marginBottom:8}}>🔍</div>
                  <div style={{fontSize:13}}>Tippe um zu suchen</div>
                  <div style={{fontSize:11,marginTop:4,color:C.dim}}>150+ Lebensmittel verfügbar</div>
                </div>
              )}
              {searchRes.map(food=>(
                <button key={food.name} onClick={()=>handleSelectFood(food)} style={{width:"100%",background:selFood?.name===food.name?C.leafSoft:C.bg,border:`1.5px solid ${selFood?.name===food.name?C.leaf:C.border}`,borderRadius:14,padding:"12px 16px",marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center",color:C.text,textAlign:"left",transition:"all .15s"}}>
                  <span style={{fontSize:13,fontWeight:600}}>{food.emoji} {food.name}</span>
                  <span style={{fontSize:11,color:C.muted,flexShrink:0,marginLeft:8}}>{food.calories} kcal/100g</span>
                </button>
              ))}
              {selFood&&(()=>{const n=calcN(selFood,grams);return(
                <div style={{background:C.leafSoft,borderRadius:16,padding:16,border:`1px solid ${C.borderStrong}`,marginTop:4,animation:"popIn .2s ease"}}>
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
// ─── Übungsvorlagen nach Muskelgruppen ───────────────────────────────────────
const EXERCISE_TEMPLATES = {
  "Brust": [
    { name:"Bankdrücken", emoji:"🏋️", desc:"Lege dich auf eine flache Bank. Greife die Stange schulterbreit. Senke die Stange kontrolliert zur Brust ab und drücke sie explosiv hoch.", tips:"Schulterblätter fest zusammenziehen. Füße flach auf dem Boden. Ellbogen leicht angewinkelt lassen.", svg:"chest" },
    { name:"Schrägbankdrücken", emoji:"🏋️", desc:"Bank auf ca. 30–45° einstellen. Stange oder Kurzhanteln zur Oberbrust führen.", tips:"Obere Brust stärker aktivieren. Schultern nach unten und hinten ziehen.", svg:"incline" },
    { name:"Fliegende", emoji:"💪", desc:"Kurzhanteln über der Brust halten. Arme weit nach außen absenken (leicht gebeugt) und wieder zusammenführen.", tips:"Bewegung aus dem Schultergelenk, nicht aus dem Ellbogen. Brust bewusst zusammendrücken.", svg:"fly" },
    { name:"Liegestütz", emoji:"🤸", desc:"Körper bildet eine gerade Linie. Hände schulterbreit. Brust berührt fast den Boden.", tips:"Core anspannen. Nicht die Hüfte durchhängen lassen. Langsam runter, schnell hoch.", svg:"pushup" },
    { name:"Dips (Brust)", emoji:"💪", desc:"An parallelen Stangen leicht nach vorne lehnen. Tief absenken bis die Ellbogen 90° haben.", tips:"Mehr Vorwärtsneigung = mehr Brust. Aufrecht = mehr Trizeps.", svg:"dips" },
  ],
  "Rücken": [
    { name:"Kreuzheben", emoji:"🏋️", desc:"Hüftbreit stehen. Rücken gerade, Stange nah am Körper. Mit den Beinen und Hüfte hochdrücken.", tips:"Kein runder Rücken. Bauch anspannen. Blick leicht nach vorne.", svg:"deadlift" },
    { name:"Klimmzüge", emoji:"🧗", desc:"Schulterbreit an der Stange. Aus gestreckten Armen hochziehen bis das Kinn über die Stange kommt.", tips:"Schulterblätter aktiv einziehen. Nicht schaukeln. Kontrolliert absenken.", svg:"pullup" },
    { name:"Rudern (Langhantel)", emoji:"🏋️", desc:"Vorbeuge ca. 45°. Stange zum Bauchnabel ziehen. Ellbogen nah am Körper führen.", tips:"Rücken gerade halten. Schulterblätter am Ende der Bewegung zusammenziehen.", svg:"row" },
    { name:"Latziehen", emoji:"💪", desc:"Griffweite wählen (weit = Breite, eng = Dicke). Stange zum oberen Brustbereich ziehen.", tips:"Nicht nach hinten lehnen. Ellbogen nach unten führen. Bewegung bewusst aus dem Rücken.", svg:"lat" },
    { name:"Rudern (Kabelzug)", emoji:"🎯", desc:"Aufrecht sitzen. Kabel zum Bauch ziehen. Schulterblätter zusammendrücken.", tips:"Rumpf stabil halten. Nicht mit dem Körper schwingen. Volle Bewegungsamplitude.", svg:"cable" },
  ],
  "Beine": [
    { name:"Kniebeugen", emoji:"🦵", desc:"Füße schulterbreit. Knie über die Fußspitzen. Tief in die Hocke, Oberschenkel parallel zum Boden.", tips:"Knie nicht nach innen fallen lassen. Fersen auf dem Boden. Brust hoch.", svg:"squat" },
    { name:"Beinpresse", emoji:"🦵", desc:"Rücken flach anlehnen. Füße hüftbreit auf der Platte. Knie in Richtung Schulter beugen.", tips:"Knie nicht überstrecken. Hüfte vom Sitz nicht abheben. Kontrolliert absenken.", svg:"legpress" },
    { name:"Ausfallschritte", emoji:"🏃", desc:"Einen großen Schritt nach vorne. Hinteres Knie fast den Boden berühren. Zurückdrücken.", tips:"Oberkörper aufrecht. Vorderes Knie hinter der Fußspitze. Gewicht auf der Ferse.", svg:"lunge" },
    { name:"Beinbeuger", emoji:"🦵", desc:"Bäuchlings auf der Maschine. Fersen zu den Gesäß ziehen. Kontrolliert strecken.", tips:"Hüfte auf der Polsterung lassen. Volle Streckung am Anfang. Langsam absenken.", svg:"legcurl" },
    { name:"Wadenheben", emoji:"🦵", desc:"Auf den Fußballen stehen. So hoch wie möglich auf die Zehenspitzen. Langsam absenken.", tips:"Volle Bewegungsamplitude. Kurze Pause oben. Auch einbeinig möglich.", svg:"calf" },
  ],
  "Schulter": [
    { name:"Schulterdrücken", emoji:"🏋️", desc:"Stange oder Kurzhanteln auf Schulterhöhe. Über den Kopf drücken. Arme nicht ganz strecken.", tips:"Core anspannen. Nicht ins Hohlkreuz fallen. Ellbogen leicht nach vorne.", svg:"ohp" },
    { name:"Seitheben", emoji:"💪", desc:"Kurzhanteln seitlich heben bis auf Schulterhöhe. Ellbogen leicht gebeugt.", tips:"Nicht schwingen. Daumen leicht nach unten (Ausschütten). Schulterblatt bleibt unten.", svg:"lateral" },
    { name:"Frontheben", emoji:"💪", desc:"Hantel nach vorne heben bis auf Schulterhöhe. Abwechselnd oder beide gleichzeitig.", tips:"Rumpf nicht nach hinten lehnen. Kontrolliert absenken. Nicht zu schwer.", svg:"frontraise" },
    { name:"Reverse Flyes", emoji:"🤸", desc:"Vorbeuge ca. 45°. Kurzhanteln nach hinten außen heben – hintere Schulter aktivieren.", tips:"Ellbogen nur leicht gebeugt. Schulterblätter zusammenziehen. Keine Schwungbewegung.", svg:"rear" },
    { name:"Face Pulls", emoji:"🎯", desc:"Kabelzug auf Kopfhöhe. Seil zu den Ohren ziehen. Ellbogen weit nach außen.", tips:"Wichtig für Schultergesundheit. Hintere Schulter und Rotatorenmanschette.", svg:"facepull" },
  ],
  "Bizeps": [
    { name:"Bizepscurl (Langhantel)", emoji:"💪", desc:"Schulterbreit greifen. Stange zur Brust curlen. Ellbogen bleibt an der Seite.", tips:"Nicht mit den Schultern schwingen. Oben kurz halten. Langsam absenken.", svg:"bbcurl" },
    { name:"Hammercurl", emoji:"💪", desc:"Neutral greifen (Daumen nach oben). Hantel zur Schulter curlen.", tips:"Trainiert Brachialis und Brachioradialis zusätzlich. Guter Biceps-Aufbau.", svg:"hammer" },
    { name:"Konzentrationscurl", emoji:"💪", desc:"Sitzend, Ellbogen am Oberschenkel abstützen. Einseitig curlen.", tips:"Maximale Isolation. Volle Bewegungsamplitude. Oben kurz einspannen.", svg:"conc" },
    { name:"Schrägbankscurl", emoji:"💪", desc:"Bank auf 45° stellen. Arme hängen lassen. Volle Streckung am unteren Punkt.", tips:"Bessere Dehnung des Bizeps. Ellbogen nicht nach vorne bewegen.", svg:"inccurl" },
  ],
  "Trizeps": [
    { name:"Trizepsdrücken (Kabel)", emoji:"💪", desc:"Kabel von oben. Ellbogen am Körper. Unterarme nach unten strecken.", tips:"Ellbogen fest am Körper. Volle Streckung am Ende. Verschiedene Griffe möglich.", svg:"tricpush" },
    { name:"Skull Crusher", emoji:"🏋️", desc:"Auf einer Bank liegend. Stange zur Stirn absenken. Ellbogen zeigt nach oben.", tips:"Ellbogen bleibt stationär. Kontrolliert absenken. Lange Trizepsportion gut trainiert.", svg:"skull" },
    { name:"Dips (Trizeps)", emoji:"💪", desc:"An zwei Bänken. Körper aufrecht. Tief absenken. Kraft aus Trizeps.", tips:"Aufrechte Haltung für mehr Trizeps. Ellbogen zeigen nach hinten.", svg:"tricdip" },
    { name:"Überkopfdrücken (Trizeps)", emoji:"💪", desc:"Hantel über dem Kopf halten. Ellbogen gebeugt. Strecken bis Arm gerade.", tips:"Langen Trizepskopf gut trainiert. Ellbogen zeigt nach oben. Rücken gerade.", svg:"tricoverhead" },
  ],
};

// Detaillierte Strichmännchen-Skizzen für jede Übung
// Jede Skizze zeigt 1-2 Positionen (Start + Ende) wie im Referenzbild
function ExerciseSketch({type}){
  const c="#4a7c59", cL="#7aab88", w=2, wB=2.5;
  // Helper: Strichmännchen stehend bei x,y (y=Kopf-Mitte)
  // Skizzen zeigen typisch 2 Figuren: Startposition links, Endposition rechts
  const sketches={

    // ── BRUST ──────────────────────────────────────────────────────────────
    chest:<svg viewBox="0 0 160 80" width="160" height="80" xmlns="http://www.w3.org/2000/svg">
      {/* Bankdrücken: liegend, Stange hoch + runter */}
      {/* Bank */}
      <rect x="5" y="52" width="70" height="6" rx="3" fill={cL} opacity=".4"/>
      {/* Person liegend – Stange unten (Brust) */}
      <circle cx="20" cy="46" r="5" fill="none" stroke={c} strokeWidth={w}/>
      <line x1="20" y1="51" x2="20" y2="52" stroke={c} strokeWidth={w}/>
      <line x1="15" y1="30" x2="55" y2="30" stroke={c} strokeWidth={wB} strokeLinecap="round"/>
      <circle cx="12" cy="30" r="4" fill="none" stroke={c} strokeWidth={w}/><circle cx="58" cy="30" r="4" fill="none" stroke={c} strokeWidth={w}/>
      <line x1="20" y1="51" x2="16" y2="38" stroke={c} strokeWidth={w}/>
      <line x1="20" y1="51" x2="24" y2="38" stroke={c} strokeWidth={w}/>
      <line x1="16" y1="38" x2="15" y2="30" stroke={c} strokeWidth={w}/>
      <line x1="24" y1="38" x2="55" y2="30" stroke={c} strokeWidth={w}/>
      <line x1="20" y1="52" x2="16" y2="62" stroke={c} strokeWidth={w}/>
      <line x1="20" y1="52" x2="26" y2="60" stroke={c} strokeWidth={w}/>
      {/* Pfeil rauf */}
      <line x1="80" y1="35" x2="80" y2="18" stroke={cL} strokeWidth="1.5" strokeDasharray="3,2"/>
      <polygon points="80,14 77,21 83,21" fill={cL}/>
      {/* Person liegend – Stange oben */}
      <rect x="90" y="52" width="70" height="6" rx="3" fill={cL} opacity=".4"/>
      <circle cx="105" cy="46" r="5" fill="none" stroke={c} strokeWidth={w}/>
      <line x1="90" y1="18" x2="160" y2="18" stroke={c} strokeWidth={wB} strokeLinecap="round"/>
      <circle cx="87" cy="18" r="4" fill="none" stroke={c} strokeWidth={w}/><circle cx="163" cy="18" r="4" fill="none" stroke={c} strokeWidth={w}/>
      <line x1="105" y1="51" x2="95" y2="30" stroke={c} strokeWidth={w}/>
      <line x1="105" y1="51" x2="115" y2="30" stroke={c} strokeWidth={w}/>
      <line x1="95" y1="30" x2="90" y2="18" stroke={c} strokeWidth={w}/>
      <line x1="115" y1="30" x2="160" y2="18" stroke={c} strokeWidth={w}/>
      <line x1="105" y1="52" x2="101" y2="62" stroke={c} strokeWidth={w}/>
      <line x1="105" y1="52" x2="111" y2="60" stroke={c} strokeWidth={w}/>
    </svg>,

    incline:<svg viewBox="0 0 160 85" width="160" height="85" xmlns="http://www.w3.org/2000/svg">
      {/* Schrägbankdrücken */}
      <line x1="5" y1="75" x2="75" y2="40" stroke={cL} strokeWidth="4" strokeLinecap="round" opacity=".5"/>
      <rect x="5" y="72" width="8" height="12" rx="2" fill={cL} opacity=".4"/>
      <circle cx="30" cy="34" r="5" fill="none" stroke={c} strokeWidth={w}/>
      <line x1="30" y1="39" x2="28" y2="50" stroke={c} strokeWidth={w}/>
      <line x1="15" y1="28" x2="55" y2="28" stroke={c} strokeWidth={wB} strokeLinecap="round"/>
      <circle cx="12" cy="28" r="4" fill="none" stroke={c} strokeWidth={w}/><circle cx="58" cy="28" r="4" fill="none" stroke={c} strokeWidth={w}/>
      <line x1="28" y1="44" x2="18" y2="36" stroke={c} strokeWidth={w}/>
      <line x1="28" y1="44" x2="55" y2="28" stroke={c} strokeWidth={w}/>
      <line x1="28" y1="50" x2="22" y2="60" stroke={c} strokeWidth={w}/>
      <line x1="28" y1="50" x2="38" y2="58" stroke={c} strokeWidth={w}/>
      <line x1="80" y1="38" x2="80" y2="20" stroke={cL} strokeWidth="1.5" strokeDasharray="3,2"/>
      <polygon points="80,16 77,23 83,23" fill={cL}/>
      <line x1="100" y1="22" x2="160" y2="22" stroke={c} strokeWidth={wB} strokeLinecap="round"/>
      <circle cx="97" cy="22" r="4" fill="none" stroke={c} strokeWidth={w}/><circle cx="163" cy="22" r="4" fill="none" stroke={c} strokeWidth={w}/>
      <circle cx="120" cy="34" r="5" fill="none" stroke={c} strokeWidth={w}/>
      <line x1="100" y1="75" x2="160" y2="45" stroke={cL} strokeWidth="4" strokeLinecap="round" opacity=".5"/>
      <line x1="120" y1="39" x2="118" y2="55" stroke={c} strokeWidth={w}/>
      <line x1="118" y1="49" x2="100" y2="38" stroke={c} strokeWidth={w}/>
      <line x1="118" y1="49" x2="158" y2="22" stroke={c} strokeWidth={w}/>
      <line x1="118" y1="55" x2="112" y2="65" stroke={c} strokeWidth={w}/>
      <line x1="118" y1="55" x2="128" y2="63" stroke={c} strokeWidth={w}/>
    </svg>,

    fly:<svg viewBox="0 0 160 80" width="160" height="80" xmlns="http://www.w3.org/2000/svg">
      {/* Fliegende: Arme weit unten → Arme oben zusammen */}
      <rect x="5" y="52" width="70" height="6" rx="3" fill={cL} opacity=".4"/>
      <circle cx="35" cy="46" r="5" fill="none" stroke={c} strokeWidth={w}/>
      <line x1="35" y1="51" x2="35" y2="52" stroke={c} strokeWidth={w}/>
      {/* Arme weit offen */}
      <line x1="35" y1="51" x2="8" y2="42" stroke={c} strokeWidth={w}/>
      <line x1="35" y1="51" x2="63" y2="42" stroke={c} strokeWidth={w}/>
      <circle cx="6" cy="41" r="3" fill={c} opacity=".5"/><circle cx="65" cy="41" r="3" fill={c} opacity=".5"/>
      <line x1="35" y1="52" x2="30" y2="62" stroke={c} strokeWidth={w}/>
      <line x1="35" y1="52" x2="41" y2="60" stroke={c} strokeWidth={w}/>
      <line x1="80" y1="40" x2="80" y2="24" stroke={cL} strokeWidth="1.5" strokeDasharray="3,2"/>
      <polygon points="80,20 77,27 83,27" fill={cL}/>
      <rect x="90" y="52" width="70" height="6" rx="3" fill={cL} opacity=".4"/>
      <circle cx="125" cy="46" r="5" fill="none" stroke={c} strokeWidth={w}/>
      <line x1="125" y1="51" x2="125" y2="52" stroke={c} strokeWidth={w}/>
      {/* Arme oben zusammen */}
      <line x1="125" y1="51" x2="108" y2="30" stroke={c} strokeWidth={w}/>
      <line x1="125" y1="51" x2="142" y2="30" stroke={c} strokeWidth={w}/>
      <line x1="108" y1="30" x2="125" y2="26" stroke={c} strokeWidth={w}/>
      <line x1="142" y1="30" x2="125" y2="26" stroke={c} strokeWidth={w}/>
      <circle cx="125" cy="25" r="3" fill={c} opacity=".5"/>
      <line x1="125" y1="52" x2="120" y2="62" stroke={c} strokeWidth={w}/>
      <line x1="125" y1="52" x2="131" y2="60" stroke={c} strokeWidth={w}/>
    </svg>,

    pushup:<svg viewBox="0 0 160 70" width="160" height="70" xmlns="http://www.w3.org/2000/svg">
      {/* Liegestütz: oben gestreckt → unten gebeugt */}
      {/* Position oben */}
      <circle cx="18" cy="20" r="5" fill="none" stroke={c} strokeWidth={w}/>
      <line x1="18" y1="25" x2="55" y2="30" stroke={c} strokeWidth={w}/>
      <line x1="18" y1="25" x2="22" y2="38" stroke={c} strokeWidth={w}/>
      <line x1="22" y1="38" x2="8" y2="45" stroke={c} strokeWidth={w}/>
      <line x1="55" y1="30" x2="60" y2="45" stroke={c} strokeWidth={w}/>
      <line x1="8" y1="45" x2="60" y2="45" stroke={c} strokeWidth={w} strokeLinecap="round"/>
      <line x1="8" y1="45" x2="5" y2="52" stroke={c} strokeWidth={w}/>
      <line x1="60" y1="45" x2="63" y2="52" stroke={c} strokeWidth={w}/>
      <line x1="5" y1="52" x2="63" y2="52" stroke={cL} strokeWidth="1.5"/>
      {/* Pfeil */}
      <line x1="80" y1="38" x2="80" y2="55" stroke={cL} strokeWidth="1.5" strokeDasharray="3,2"/>
      <polygon points="80,58 77,51 83,51" fill={cL}/>
      {/* Position unten */}
      <circle cx="103" cy="30" r="5" fill="none" stroke={c} strokeWidth={w}/>
      <line x1="103" y1="35" x2="140" y2="38" stroke={c} strokeWidth={w}/>
      <line x1="103" y1="35" x2="100" y2="48" stroke={c} strokeWidth={w}/>
      <line x1="100" y1="48" x2="88" y2="52" stroke={c} strokeWidth={w}/>
      <line x1="140" y1="38" x2="145" y2="52" stroke={c} strokeWidth={w}/>
      <line x1="88" y1="52" x2="145" y2="52" stroke={cL} strokeWidth="1.5"/>
      <line x1="88" y1="52" x2="86" y2="58" stroke={c} strokeWidth={w}/>
      <line x1="145" y1="52" x2="148" y2="58" stroke={c} strokeWidth={w}/>
    </svg>,

    dips:<svg viewBox="0 0 120 90" width="120" height="90" xmlns="http://www.w3.org/2000/svg">
      {/* Dips: oben gestreckt → unten gebeugt */}
      {/* Stangen */}
      <line x1="15" y1="5" x2="15" y2="70" stroke={c} strokeWidth="3" strokeLinecap="round" opacity=".4"/>
      <line x1="75" y1="5" x2="75" y2="70" stroke={c} strokeWidth="3" strokeLinecap="round" opacity=".4"/>
      <line x1="10" y1="22" x2="80" y2="22" stroke={c} strokeWidth="3" strokeLinecap="round" opacity=".3"/>
      {/* Person oben (gestreckt) */}
      <circle cx="45" cy="14" r="5" fill="none" stroke={c} strokeWidth={w}/>
      <line x1="45" y1="19" x2="45" y2="35" stroke={c} strokeWidth={w}/>
      <line x1="15" y1="22" x2="45" y2="28" stroke={c} strokeWidth={w}/>
      <line x1="75" y1="22" x2="45" y2="28" stroke={c} strokeWidth={w}/>
      <line x1="45" y1="35" x2="38" y2="50" stroke={c} strokeWidth={w}/>
      <line x1="45" y1="35" x2="52" y2="50" stroke={c} strokeWidth={w}/>
      <line x1="38" y1="50" x2="36" y2="62" stroke={c} strokeWidth={w}/>
      <line x1="52" y1="50" x2="54" y2="62" stroke={c} strokeWidth={w}/>
      {/* Pfeil runter */}
      <line x1="90" y1="25" x2="90" y2="48" stroke={cL} strokeWidth="1.5" strokeDasharray="3,2"/>
      <polygon points="90,52 87,45 93,45" fill={cL}/>
      {/* Person unten (gebeugt, Ellbogen 90°) – kleiner daneben */}
      <circle cx="110" cy="35" r="4" fill="none" stroke={c} strokeWidth={w}/>
      <line x1="110" y1="39" x2="110" y2="52" stroke={c} strokeWidth={w}/>
      <line x1="100" y1="38" x2="110" y2="46" stroke={c} strokeWidth={w}/>
      <line x1="100" y1="38" x2="98" y2="28" stroke={c} strokeWidth={w}/>
      <line x1="120" y1="38" x2="110" y2="46" stroke={c} strokeWidth={w}/>
      <line x1="120" y1="38" x2="122" y2="28" stroke={c} strokeWidth={w}/>
      <line x1="110" y1="52" x2="105" y2="64" stroke={c} strokeWidth={w}/>
      <line x1="110" y1="52" x2="115" y2="64" stroke={c} strokeWidth={w}/>
    </svg>,

    // ── RÜCKEN ─────────────────────────────────────────────────────────────
    deadlift:<svg viewBox="0 0 160 90" width="160" height="90" xmlns="http://www.w3.org/2000/svg">
      {/* Kreuzheben: gebeugt → aufrecht */}
      {/* Hantelstange am Boden */}
      <line x1="5" y1="75" x2="75" y2="75" stroke={c} strokeWidth={wB} strokeLinecap="round"/>
      <circle cx="8" cy="75" r="6" fill="none" stroke={c} strokeWidth={w}/><circle cx="72" cy="75" r="6" fill="none" stroke={c} strokeWidth={w}/>
      {/* Person gebeugt */}
      <circle cx="22" cy="22" r="5" fill="none" stroke={c} strokeWidth={w}/>
      <line x1="22" y1="27" x2="18" y2="45" stroke={c} strokeWidth={w}/>
      <line x1="18" y1="45" x2="8" y2="75" stroke={c} strokeWidth={w}/>
      <line x1="18" y1="45" x2="35" y2="60" stroke={c} strokeWidth={w}/>
      <line x1="22" y1="27" x2="40" y2="38" stroke={c} strokeWidth={w}/>
      <line x1="40" y1="38" x2="45" y2="69" stroke={c} strokeWidth={w}/>
      <line x1="35" y1="60" x2="30" y2="80" stroke={c} strokeWidth={w}/>
      {/* Pfeil rauf */}
      <line x1="80" y1="55" x2="80" y2="30" stroke={cL} strokeWidth="1.5" strokeDasharray="3,2"/>
      <polygon points="80,26 77,33 83,33" fill={cL}/>
      {/* Person aufrecht mit Stange */}
      <line x1="90" y1="75" x2="160" y2="75" stroke={c} strokeWidth={wB} strokeLinecap="round"/>
      <circle cx="93" cy="75" r="6" fill="none" stroke={c} strokeWidth={w}/><circle cx="157" cy="75" r="6" fill="none" stroke={c} strokeWidth={w}/>
      <circle cx="125" cy="12" r="5" fill="none" stroke={c} strokeWidth={w}/>
      <line x1="125" y1="17" x2="125" y2="38" stroke={c} strokeWidth={w}/>
      <line x1="115" y1="30" x2="155" y2="30" stroke={c} strokeWidth={wB} strokeLinecap="round"/>
      <line x1="125" y1="38" x2="115" y2="55" stroke={c} strokeWidth={w}/>
      <line x1="125" y1="38" x2="135" y2="55" stroke={c} strokeWidth={w}/>
      <line x1="115" y1="55" x2="112" y2="75" stroke={c} strokeWidth={w}/>
      <line x1="135" y1="55" x2="138" y2="75" stroke={c} strokeWidth={w}/>
    </svg>,

    pullup:<svg viewBox="0 0 160 95" width="160" height="95" xmlns="http://www.w3.org/2000/svg">
      {/* Klimmzüge: hängend → hochgezogen */}
      <rect x="5" y="5" width="70" height="6" rx="3" fill={c} opacity=".45"/>
      {/* Hängend */}
      <circle cx="35" cy="24" r="5" fill="none" stroke={c} strokeWidth={w}/>
      <line x1="25" y1="11" x2="35" y2="20" stroke={c} strokeWidth={w}/>
      <line x1="45" y1="11" x2="35" y2="20" stroke={c} strokeWidth={w}/>
      <line x1="35" y1="29" x2="35" y2="48" stroke={c} strokeWidth={w}/>
      <line x1="35" y1="38" x2="22" y2="45" stroke={c} strokeWidth={w}/>
      <line x1="35" y1="38" x2="48" y2="45" stroke={c} strokeWidth={w}/>
      <line x1="35" y1="48" x2="28" y2="65" stroke={c} strokeWidth={w}/>
      <line x1="35" y1="48" x2="42" y2="65" stroke={c} strokeWidth={w}/>
      <line x1="28" y1="65" x2="25" y2="78" stroke={c} strokeWidth={w}/>
      <line x1="42" y1="65" x2="45" y2="78" stroke={c} strokeWidth={w}/>
      {/* Pfeil rauf */}
      <line x1="80" y1="60" x2="80" y2="30" stroke={cL} strokeWidth="1.5" strokeDasharray="3,2"/>
      <polygon points="80,26 77,33 83,33" fill={cL}/>
      {/* Hochgezogen */}
      <rect x="90" y="5" width="70" height="6" rx="3" fill={c} opacity=".45"/>
      <circle cx="125" cy="18" r="5" fill="none" stroke={c} strokeWidth={w}/>
      <line x1="115" y1="11" x2="118" y2="18" stroke={c} strokeWidth={w}/>
      <line x1="135" y1="11" x2="132" y2="18" stroke={c} strokeWidth={w}/>
      <line x1="125" y1="23" x2="125" y2="40" stroke={c} strokeWidth={w}/>
      <line x1="125" y1="30" x2="112" y2="22" stroke={c} strokeWidth={w}/>
      <line x1="125" y1="30" x2="138" y2="22" stroke={c} strokeWidth={w}/>
      <line x1="125" y1="40" x2="118" y2="55" stroke={c} strokeWidth={w}/>
      <line x1="125" y1="40" x2="132" y2="55" stroke={c} strokeWidth={w}/>
      <line x1="118" y1="55" x2="115" y2="70" stroke={c} strokeWidth={w}/>
      <line x1="132" y1="55" x2="135" y2="70" stroke={c} strokeWidth={w}/>
    </svg>,

    row:<svg viewBox="0 0 160 85" width="160" height="85" xmlns="http://www.w3.org/2000/svg">
      {/* Rudern LH: gebeugt, Stange unten → oben */}
      <line x1="5" y1="72" x2="75" y2="72" stroke={c} strokeWidth={wB} strokeLinecap="round"/>
      <circle cx="8" cy="72" r="5" fill="none" stroke={c} strokeWidth={w}/><circle cx="72" cy="72" r="5" fill="none" stroke={c} strokeWidth={w}/>
      {/* Stange unten */}
      <circle cx="28" cy="18" r="5" fill="none" stroke={c} strokeWidth={w}/>
      <line x1="28" y1="23" x2="22" y2="40" stroke={c} strokeWidth={w}/>
      <line x1="22" y1="40" x2="18" y2="68" stroke={c} strokeWidth={w}/>
      <line x1="22" y1="40" x2="38" y2="55" stroke={c} strokeWidth={w}/>
      <line x1="22" y1="33" x2="12" y2="65" stroke={c} strokeWidth={w}/>
      <line x1="22" y1="33" x2="40" y2="42" stroke={c} strokeWidth={w}/>
      <line x1="38" y1="55" x2="35" y2="72" stroke={c} strokeWidth={w}/>
      <line x1="40" y1="42" x2="40" y2="65" stroke={c} strokeWidth={w}/>
      {/* Pfeil rauf */}
      <line x1="80" y1="55" x2="80" y2="32" stroke={cL} strokeWidth="1.5" strokeDasharray="3,2"/>
      <polygon points="80,28 77,35 83,35" fill={cL}/>
      {/* Stange oben (zum Bauch) */}
      <line x1="90" y1="72" x2="160" y2="72" stroke={c} strokeWidth={wB} strokeLinecap="round"/>
      <circle cx="93" cy="72" r="5" fill="none" stroke={c} strokeWidth={w}/><circle cx="157" cy="72" r="5" fill="none" stroke={c} strokeWidth={w}/>
      <circle cx="115" cy="18" r="5" fill="none" stroke={c} strokeWidth={w}/>
      <line x1="115" y1="23" x2="110" y2="40" stroke={c} strokeWidth={w}/>
      <line x1="110" y1="40" x2="106" y2="68" stroke={c} strokeWidth={w}/>
      <line x1="110" y1="40" x2="126" y2="55" stroke={c} strokeWidth={w}/>
      <line x1="110" y1="33" x2="100" y2="50" stroke={c} strokeWidth={w}/>
      <line x1="100" y1="50" x2="125" y2="50" stroke={c} strokeWidth={wB} strokeLinecap="round"/>
      <circle cx="97" cy="50" r="4" fill="none" stroke={c} strokeWidth={w}/><circle cx="128" cy="50" r="4" fill="none" stroke={c} strokeWidth={w}/>
      <line x1="126" y1="55" x2="123" y2="72" stroke={c} strokeWidth={w}/>
      <line x1="128" y1="50" x2="128" y2="65" stroke={c} strokeWidth={w}/>
    </svg>,

    lat:<svg viewBox="0 0 120 95" width="120" height="95" xmlns="http://www.w3.org/2000/svg">
      {/* Latziehen: sitzend, Stange oben → unten */}
      {/* Maschine */}
      <rect x="45" y="2" width="30" height="8" rx="3" fill={c} opacity=".3"/>
      <line x1="60" y1="10" x2="60" y2="28" stroke={c} strokeWidth="1.5" strokeDasharray="3,2" opacity=".5"/>
      {/* Sitz */}
      <rect x="38" y="68" width="44" height="6" rx="3" fill={cL} opacity=".4"/>
      {/* Person sitzend – Stange oben */}
      <circle cx="60" cy="35" r="5" fill="none" stroke={c} strokeWidth={w}/>
      <line x1="60" y1="40" x2="60" y2="58" stroke={c} strokeWidth={w}/>
      <line x1="60" y1="48" x2="42" y2="60" stroke={c} strokeWidth={w}/>
      <line x1="60" y1="48" x2="78" y2="60" stroke={c} strokeWidth={w}/>
      <line x1="60" y1="58" x2="50" y2="68" stroke={c} strokeWidth={w}/>
      <line x1="60" y1="58" x2="70" y2="68" stroke={c} strokeWidth={w}/>
      {/* Arme oben zur Stange */}
      <line x1="42" y1="60" x2="30" y2="28" stroke={c} strokeWidth={w}/>
      <line x1="78" y1="60" x2="90" y2="28" stroke={c} strokeWidth={w}/>
      <line x1="30" y1="28" x2="90" y2="28" stroke={c} strokeWidth={wB} strokeLinecap="round"/>
      <circle cx="27" cy="28" r="4" fill="none" stroke={c} strokeWidth={w}/><circle cx="93" cy="28" r="4" fill="none" stroke={c} strokeWidth={w}/>
      {/* Pfeil runter */}
      <line x1="8" y1="20" x2="8" y2="52" stroke={cL} strokeWidth="1.5" strokeDasharray="3,2"/>
      <polygon points="8,56 5,49 11,49" fill={cL}/>
    </svg>,

    cable:<svg viewBox="0 0 120 90" width="120" height="90" xmlns="http://www.w3.org/2000/svg">
      {/* Kabelrudern sitzend */}
      {/* Maschine links */}
      <rect x="2" y="10" width="12" height="60" rx="3" fill={c} opacity=".2"/>
      <circle cx="8" cy="45" r="5" fill="none" stroke={c} strokeWidth={w}/>
      <line x1="13" y1="45" x2="55" y2="55" stroke={c} strokeWidth="1.5" strokeDasharray="3,2" opacity=".6"/>
      {/* Sitz */}
      <rect x="45" y="65" width="50" height="6" rx="3" fill={cL} opacity=".4"/>
      {/* Person sitzend – Stange weit vorn */}
      <circle cx="70" cy="30" r="5" fill="none" stroke={c} strokeWidth={w}/>
      <line x1="70" y1="35" x2="70" y2="55" stroke={c} strokeWidth={w}/>
      <line x1="70" y1="43" x2="55" y2="55" stroke={c} strokeWidth={w}/>
      <line x1="70" y1="43" x2="85" y2="55" stroke={c} strokeWidth={w}/>
      <line x1="70" y1="55" x2="60" y2="65" stroke={c} strokeWidth={w}/>
      <line x1="70" y1="55" x2="80" y2="65" stroke={c} strokeWidth={w}/>
      <line x1="55" y1="55" x2="20" y2="45" stroke={c} strokeWidth={w}/>
      {/* Pfeil zurück */}
      <line x1="30" y1="22" x2="55" y2="22" stroke={cL} strokeWidth="1.5" strokeDasharray="3,2"/>
      <polygon points="58,22 51,19 51,25" fill={cL}/>
      <text x="15" y="18" fontSize="7" fill={cL}>ziehen</text>
    </svg>,

    // ── BEINE ──────────────────────────────────────────────────────────────
    squat:<svg viewBox="0 0 160 90" width="160" height="90" xmlns="http://www.w3.org/2000/svg">
      {/* Kniebeugen: aufrecht → tief */}
      {/* Stange auf Schultern */}
      <line x1="5" y1="20" x2="75" y2="20" stroke={c} strokeWidth={wB} strokeLinecap="round"/>
      <circle cx="5" cy="20" r="5" fill="none" stroke={c} strokeWidth={w}/><circle cx="75" cy="20" r="5" fill="none" stroke={c} strokeWidth={w}/>
      <circle cx="38" cy="10" r="5" fill="none" stroke={c} strokeWidth={w}/>
      <line x1="38" y1="15" x2="38" y2="30" stroke={c} strokeWidth={w}/>
      <line x1="20" y1="20" x2="55" y2="20" stroke={c} strokeWidth={wB}/>
      <line x1="38" y1="30" x2="28" y2="48" stroke={c} strokeWidth={w}/>
      <line x1="38" y1="30" x2="48" y2="48" stroke={c} strokeWidth={w}/>
      <line x1="28" y1="48" x2="24" y2="68" stroke={c} strokeWidth={w}/>
      <line x1="48" y1="48" x2="52" y2="68" stroke={c} strokeWidth={w}/>
      <line x1="24" y1="68" x2="20" y2="80" stroke={c} strokeWidth={w}/>
      <line x1="52" y1="68" x2="56" y2="80" stroke={c} strokeWidth={w}/>
      {/* Pfeil runter */}
      <line x1="80" y1="25" x2="80" y2="55" stroke={cL} strokeWidth="1.5" strokeDasharray="3,2"/>
      <polygon points="80,59 77,52 83,52" fill={cL}/>
      {/* Tief in der Hocke */}
      <line x1="90" y1="42" x2="160" y2="42" stroke={c} strokeWidth={wB} strokeLinecap="round"/>
      <circle cx="90" cy="42" r="5" fill="none" stroke={c} strokeWidth={w}/><circle cx="160" cy="42" r="5" fill="none" stroke={c} strokeWidth={w}/>
      <circle cx="122" cy="20" r="5" fill="none" stroke={c} strokeWidth={w}/>
      <line x1="122" y1="25" x2="118" y2="38" stroke={c} strokeWidth={w}/>
      <line x1="107" y1="42" x2="138" y2="42" stroke={c} strokeWidth={wB}/>
      <line x1="118" y1="38" x2="105" y2="55" stroke={c} strokeWidth={w}/>
      <line x1="118" y1="38" x2="130" y2="55" stroke={c} strokeWidth={w}/>
      <line x1="105" y1="55" x2="100" y2="68" stroke={c} strokeWidth={w}/>
      <line x1="130" y1="55" x2="140" y2="68" stroke={c} strokeWidth={w}/>
      <line x1="100" y1="68" x2="98" y2="80" stroke={c} strokeWidth={w}/>
      <line x1="140" y1="68" x2="142" y2="80" stroke={c} strokeWidth={w}/>
    </svg>,

    legpress:<svg viewBox="0 0 140 90" width="140" height="90" xmlns="http://www.w3.org/2000/svg">
      {/* Beinpresse: Beine gestreckt → gebeugt */}
      {/* Maschine/Sitz */}
      <line x1="5" y1="30" x2="50" y2="5" stroke={c} strokeWidth="3" opacity=".3" strokeLinecap="round"/>
      <rect x="5" y="28" width="30" height="38" rx="4" fill={cL} opacity=".2"/>
      {/* Person liegend/sitzend – Beine gestreckt */}
      <circle cx="22" cy="35" r="5" fill="none" stroke={c} strokeWidth={w}/>
      <line x1="22" y1="40" x2="22" y2="55" stroke={c} strokeWidth={w}/>
      <line x1="22" y1="55" x2="55" y2="40" stroke={c} strokeWidth={w}/>
      <line x1="22" y1="55" x2="55" y2="52" stroke={c} strokeWidth={w}/>
      <line x1="55" y1="40" x2="80" y2="18" stroke={c} strokeWidth={w}/>
      <line x1="55" y1="52" x2="80" y2="28" stroke={c} strokeWidth={w}/>
      <rect x="75" y="12" width="12" height="22" rx="3" fill={c} opacity=".3"/>
      {/* Pfeil */}
      <line x1="95" y1="40" x2="110" y2="40" stroke={cL} strokeWidth="1.5" strokeDasharray="3,2"/>
      <polygon points="113,40 106,37 106,43" fill={cL}/>
      {/* Beine gebeugt */}
      <rect x="118" y="28" width="18" height="30" rx="4" fill={cL} opacity=".2"/>
      <circle cx="122" cy="35" r="5" fill="none" stroke={c} strokeWidth={w}/>
      <line x1="122" y1="40" x2="122" y2="55" stroke={c} strokeWidth={w}/>
      <line x1="122" y1="55" x2="136" y2="48" stroke={c} strokeWidth={w}/>
      <line x1="122" y1="55" x2="136" y2="56" stroke={c} strokeWidth={w}/>
      <line x1="136" y1="48" x2="130" y2="30" stroke={c} strokeWidth={w}/>
      <line x1="136" y1="56" x2="130" y2="38" stroke={c} strokeWidth={w}/>
    </svg>,

    lunge:<svg viewBox="0 0 160 90" width="160" height="90" xmlns="http://www.w3.org/2000/svg">
      {/* Ausfallschritte: stehend → Ausfallschritt */}
      {/* Stehend */}
      <circle cx="30" cy="10" r="5" fill="none" stroke={c} strokeWidth={w}/>
      <line x1="30" y1="15" x2="30" y2="40" stroke={c} strokeWidth={w}/>
      <line x1="18" y1="28" x2="42" y2="28" stroke={c} strokeWidth={wB} strokeLinecap="round"/>
      <circle cx="15" cy="28" r="3" fill={c} opacity=".4"/><circle cx="45" cy="28" r="3" fill={c} opacity=".4"/>
      <line x1="30" y1="40" x2="22" y2="60" stroke={c} strokeWidth={w}/>
      <line x1="30" y1="40" x2="38" y2="60" stroke={c} strokeWidth={w}/>
      <line x1="22" y1="60" x2="18" y2="78" stroke={c} strokeWidth={w}/>
      <line x1="38" y1="60" x2="42" y2="78" stroke={c} strokeWidth={w}/>
      <line x1="12" y1="80" x2="48" y2="80" stroke={cL} strokeWidth="1.5"/>
      {/* Pfeil rechts */}
      <line x1="68" y1="40" x2="85" y2="40" stroke={cL} strokeWidth="1.5" strokeDasharray="3,2"/>
      <polygon points="88,40 81,37 81,43" fill={cL}/>
      {/* Ausfallschritt */}
      <circle cx="108" cy="10" r="5" fill="none" stroke={c} strokeWidth={w}/>
      <line x1="108" y1="15" x2="108" y2="38" stroke={c} strokeWidth={w}/>
      <line x1="95" y1="28" x2="120" y2="28" stroke={c} strokeWidth={wB} strokeLinecap="round"/>
      <circle cx="92" cy="28" r="3" fill={c} opacity=".4"/><circle cx="123" cy="28" r="3" fill={c} opacity=".4"/>
      {/* Vorderes Bein */}
      <line x1="108" y1="38" x2="118" y2="58" stroke={c} strokeWidth={w}/>
      <line x1="118" y1="58" x2="138" y2="65" stroke={c} strokeWidth={w}/>
      <line x1="138" y1="65" x2="142" y2="80" stroke={c} strokeWidth={w}/>
      {/* Hinteres Bein */}
      <line x1="108" y1="38" x2="96" y2="55" stroke={c} strokeWidth={w}/>
      <line x1="96" y1="55" x2="94" y2="78" stroke={c} strokeWidth={w}/>
      <circle cx="94" cy="80" r="3" fill={c} opacity=".5"/>
      <line x1="100" y1="80" x2="155" y2="80" stroke={cL} strokeWidth="1.5"/>
    </svg>,

    legcurl:<svg viewBox="0 0 120 80" width="120" height="80" xmlns="http://www.w3.org/2000/svg">
      {/* Beinbeuger: liegend, Beine gestreckt → gebeugt */}
      <rect x="5" y="40" width="110" height="8" rx="4" fill={cL} opacity=".3"/>
      <rect x="85" y="22" width="30" height="18" rx="4" fill={cL} opacity=".2"/>
      {/* Gestreckt */}
      <circle cx="20" cy="32" r="5" fill="none" stroke={c} strokeWidth={w}/>
      <line x1="20" y1="37" x2="20" y2="42" stroke={c} strokeWidth={w}/>
      <line x1="15" y1="40" x2="75" y2="40" stroke={c} strokeWidth={w}/>
      <line x1="75" y1="40" x2="80" y2="34" stroke={c} strokeWidth={w}/>
      <line x1="75" y1="40" x2="80" y2="44" stroke={c} strokeWidth={w}/>
      <line x1="15" y1="40" x2="12" y2="34" stroke={c} strokeWidth={w}/>
      {/* Pfeil gebeugt */}
      <line x1="60" y1="24" x2="72" y2="10" stroke={cL} strokeWidth="1.5" strokeDasharray="3,2"/>
      <polygon points="75,7 68,12 73,17" fill={cL}/>
      {/* Gebeugt */}
      <circle cx="25" cy="32" r="5" fill="none" stroke={c} strokeWidth={w} opacity=".4"/>
      <line x1="25" y1="37" x2="25" y2="42" stroke={c} strokeWidth={w} opacity=".4"/>
      <line x1="20" y1="40" x2="60" y2="40" stroke={c} strokeWidth={w} opacity=".4"/>
      <line x1="60" y1="40" x2="75" y2="15" stroke={c} strokeWidth={w}/>
      <line x1="60" y1="40" x2="72" y2="14" stroke={c} strokeWidth={w} opacity=".5"/>
    </svg>,

    calf:<svg viewBox="0 0 120 90" width="120" height="90" xmlns="http://www.w3.org/2000/svg">
      {/* Wadenheben: Fersen unten → Zehenspitzen oben */}
      {/* Stufe */}
      <rect x="20" y="72" width="80" height="10" rx="3" fill={cL} opacity=".35"/>
      <line x1="20" y1="72" x2="0" y2="72" stroke={cL} strokeWidth="2" opacity=".3"/>
      {/* Fersen unten */}
      <circle cx="40" cy="15" r="5" fill="none" stroke={c} strokeWidth={w}/>
      <line x1="40" y1="20" x2="40" y2="40" stroke={c} strokeWidth={w}/>
      <line x1="28" y1="32" x2="52" y2="32" stroke={c} strokeWidth={wB} strokeLinecap="round"/>
      <line x1="40" y1="40" x2="32" y2="58" stroke={c} strokeWidth={w}/>
      <line x1="40" y1="40" x2="48" y2="58" stroke={c} strokeWidth={w}/>
      <line x1="32" y1="58" x2="30" y2="72" stroke={c} strokeWidth={w}/>
      <line x1="48" y1="58" x2="50" y2="72" stroke={c} strokeWidth={w}/>
      <line x1="26" y1="80" x2="54" y2="80" stroke={c} strokeWidth={w}/>
      {/* Pfeil rauf */}
      <line x1="65" y1="65" x2="65" y2="45" stroke={cL} strokeWidth="1.5" strokeDasharray="3,2"/>
      <polygon points="65,41 62,48 68,48" fill={cL}/>
      {/* Zehenspitzen */}
      <circle cx="90" cy="8" r="5" fill="none" stroke={c} strokeWidth={w}/>
      <line x1="90" y1="13" x2="90" y2="33" stroke={c} strokeWidth={w}/>
      <line x1="78" y1="25" x2="102" y2="25" stroke={c} strokeWidth={wB} strokeLinecap="round"/>
      <line x1="90" y1="33" x2="82" y2="52" stroke={c} strokeWidth={w}/>
      <line x1="90" y1="33" x2="98" y2="52" stroke={c} strokeWidth={w}/>
      <line x1="82" y1="52" x2="80" y2="62" stroke={c} strokeWidth={w}/>
      <line x1="98" y1="52" x2="100" y2="62" stroke={c} strokeWidth={w}/>
      {/* Auf Zehenspitzen */}
      <line x1="75" y1="72" x2="82" y2="72" stroke={c} strokeWidth="2" strokeLinecap="round" opacity=".3"/>
      <line x1="80" y1="68" x2="82" y2="72" stroke={c} strokeWidth={w}/>
      <line x1="98" y1="68" x2="100" y2="72" stroke={c} strokeWidth={w}/>
      <line x1="80" y1="68" x2="100" y2="68" stroke={cL} strokeWidth="1.5"/>
    </svg>,

    // ── SCHULTER ───────────────────────────────────────────────────────────
    ohp:<svg viewBox="0 0 160 95" width="160" height="95" xmlns="http://www.w3.org/2000/svg">
      {/* Schulterdrücken: Stange unten → oben */}
      {/* Stange auf Schultern */}
      <circle cx="35" cy="15" r="5" fill="none" stroke={c} strokeWidth={w}/>
      <line x1="35" y1="20" x2="35" y2="40" stroke={c} strokeWidth={w}/>
      <line x1="8" y1="30" x2="62" y2="30" stroke={c} strokeWidth={wB} strokeLinecap="round"/>
      <circle cx="5" cy="30" r="5" fill="none" stroke={c} strokeWidth={w}/><circle cx="65" cy="30" r="5" fill="none" stroke={c} strokeWidth={w}/>
      <line x1="35" y1="40" x2="25" y2="60" stroke={c} strokeWidth={w}/>
      <line x1="35" y1="40" x2="45" y2="60" stroke={c} strokeWidth={w}/>
      <line x1="25" y1="60" x2="22" y2="78" stroke={c} strokeWidth={w}/>
      <line x1="45" y1="60" x2="48" y2="78" stroke={c} strokeWidth={w}/>
      <line x1="16" y1="80" x2="54" y2="80" stroke={cL} strokeWidth="1.5"/>
      {/* Pfeil rauf */}
      <line x1="80" y1="45" x2="80" y2="20" stroke={cL} strokeWidth="1.5" strokeDasharray="3,2"/>
      <polygon points="80,16 77,23 83,23" fill={cL}/>
      {/* Stange über Kopf */}
      <circle cx="120" cy="22" r="5" fill="none" stroke={c} strokeWidth={w}/>
      <line x1="95" y1="12" x2="155" y2="12" stroke={c} strokeWidth={wB} strokeLinecap="round"/>
      <circle cx="92" cy="12" r="5" fill="none" stroke={c} strokeWidth={w}/><circle cx="158" cy="12" r="5" fill="none" stroke={c} strokeWidth={w}/>
      <line x1="120" y1="27" x2="120" y2="45" stroke={c} strokeWidth={w}/>
      <line x1="95" y1="12" x2="110" y2="32" stroke={c} strokeWidth={w}/>
      <line x1="155" y1="12" x2="130" y2="32" stroke={c} strokeWidth={w}/>
      <line x1="120" y1="45" x2="110" y2="65" stroke={c} strokeWidth={w}/>
      <line x1="120" y1="45" x2="130" y2="65" stroke={c} strokeWidth={w}/>
      <line x1="110" y1="65" x2="107" y2="80" stroke={c} strokeWidth={w}/>
      <line x1="130" y1="65" x2="133" y2="80" stroke={c} strokeWidth={w}/>
      <line x1="100" y1="82" x2="140" y2="82" stroke={cL} strokeWidth="1.5"/>
    </svg>,

    lateral:<svg viewBox="0 0 160 90" width="160" height="90" xmlns="http://www.w3.org/2000/svg">
      {/* Seitheben: Arme unten → seitlich auf Höhe */}
      {/* Arme unten */}
      <circle cx="35" cy="15" r="5" fill="none" stroke={c} strokeWidth={w}/>
      <line x1="35" y1="20" x2="35" y2="42" stroke={c} strokeWidth={w}/>
      <line x1="18" y1="32" x2="52" y2="32" stroke={c} strokeWidth={wB} strokeLinecap="round"/>
      <line x1="18" y1="32" x2="12" y2="48" stroke={c} strokeWidth={w}/>
      <line x1="52" y1="32" x2="58" y2="48" stroke={c} strokeWidth={w}/>
      <circle cx="10" cy="50" r="3" fill={c} opacity=".5"/><circle cx="60" cy="50" r="3" fill={c} opacity=".5"/>
      <line x1="35" y1="42" x2="26" y2="62" stroke={c} strokeWidth={w}/>
      <line x1="35" y1="42" x2="44" y2="62" stroke={c} strokeWidth={w}/>
      <line x1="26" y1="62" x2="23" y2="78" stroke={c} strokeWidth={w}/>
      <line x1="44" y1="62" x2="47" y2="78" stroke={c} strokeWidth={w}/>
      {/* Pfeil rauf */}
      <line x1="80" y1="48" x2="80" y2="28" stroke={cL} strokeWidth="1.5" strokeDasharray="3,2"/>
      <polygon points="80,24 77,31 83,31" fill={cL}/>
      {/* Arme seitlich auf Schulterniveau */}
      <circle cx="120" cy="15" r="5" fill="none" stroke={c} strokeWidth={w}/>
      <line x1="120" y1="20" x2="120" y2="42" stroke={c} strokeWidth={w}/>
      <line x1="93" y1="30" x2="147" y2="30" stroke={c} strokeWidth={wB} strokeLinecap="round"/>
      <circle cx="90" cy="30" r="3" fill={c} opacity=".5"/><circle cx="150" cy="30" r="3" fill={c} opacity=".5"/>
      <line x1="93" y1="30" x2="120" y2="30" stroke={c} strokeWidth={w}/>
      <line x1="120" y1="30" x2="147" y2="30" stroke={c} strokeWidth={w}/>
      <line x1="120" y1="42" x2="111" y2="62" stroke={c} strokeWidth={w}/>
      <line x1="120" y1="42" x2="129" y2="62" stroke={c} strokeWidth={w}/>
      <line x1="111" y1="62" x2="108" y2="78" stroke={c} strokeWidth={w}/>
      <line x1="129" y1="62" x2="132" y2="78" stroke={c} strokeWidth={w}/>
    </svg>,

    frontraise:<svg viewBox="0 0 160 90" width="160" height="90" xmlns="http://www.w3.org/2000/svg">
      {/* Frontheben: Arm unten → vorne auf Schulterniveau */}
      <circle cx="35" cy="15" r="5" fill="none" stroke={c} strokeWidth={w}/>
      <line x1="35" y1="20" x2="35" y2="42" stroke={c} strokeWidth={w}/>
      <line x1="20" y1="30" x2="50" y2="30" stroke={c} strokeWidth={wB} strokeLinecap="round"/>
      <line x1="20" y1="30" x2="15" y2="48" stroke={c} strokeWidth={w}/>
      <line x1="50" y1="30" x2="55" y2="48" stroke={c} strokeWidth={w}/>
      <circle cx="55" cy="50" r="3" fill={c} opacity=".5"/>
      <circle cx="13" cy="50" r="3" fill={c} opacity=".5"/>
      <line x1="35" y1="42" x2="26" y2="60" stroke={c} strokeWidth={w}/>
      <line x1="35" y1="42" x2="44" y2="60" stroke={c} strokeWidth={w}/>
      <line x1="26" y1="60" x2="22" y2="78" stroke={c} strokeWidth={w}/>
      <line x1="44" y1="60" x2="48" y2="78" stroke={c} strokeWidth={w}/>
      <line x1="80" y1="42" x2="80" y2="25" stroke={cL} strokeWidth="1.5" strokeDasharray="3,2"/>
      <polygon points="80,21 77,28 83,28" fill={cL}/>
      {/* Arm nach vorne oben */}
      <circle cx="120" cy="15" r="5" fill="none" stroke={c} strokeWidth={w}/>
      <line x1="120" y1="20" x2="120" y2="42" stroke={c} strokeWidth={w}/>
      <line x1="105" y1="30" x2="135" y2="30" stroke={c} strokeWidth={wB} strokeLinecap="round"/>
      <line x1="105" y1="30" x2="100" y2="50" stroke={c} strokeWidth={w}/>
      {/* Arm vorne hoch */}
      <line x1="135" y1="30" x2="155" y2="10" stroke={c} strokeWidth={w}/>
      <circle cx="157" cy="9" r="3" fill={c} opacity=".5"/>
      <line x1="120" y1="42" x2="111" y2="60" stroke={c} strokeWidth={w}/>
      <line x1="120" y1="42" x2="129" y2="60" stroke={c} strokeWidth={w}/>
      <line x1="111" y1="60" x2="108" y2="78" stroke={c} strokeWidth={w}/>
      <line x1="129" y1="60" x2="132" y2="78" stroke={c} strokeWidth={w}/>
    </svg>,

    rear:<svg viewBox="0 0 120 85" width="120" height="85" xmlns="http://www.w3.org/2000/svg">
      {/* Reverse Flyes: Vorbeuge, Arme hängend → gespreizt */}
      {/* Arme hängend */}
      <circle cx="28" cy="15" r="5" fill="none" stroke={c} strokeWidth={w}/>
      <line x1="28" y1="20" x2="22" y2="38" stroke={c} strokeWidth={w}/>
      <line x1="22" y1="30" x2="12" y2="42" stroke={c} strokeWidth={w}/>
      <line x1="22" y1="30" x2="32" y2="42" stroke={c} strokeWidth={w}/>
      <circle cx="10" cy="44" r="3" fill={c} opacity=".5"/>
      <circle cx="34" cy="44" r="3" fill={c} opacity=".5"/>
      <line x1="22" y1="38" x2="14" y2="56" stroke={c} strokeWidth={w}/>
      <line x1="22" y1="38" x2="30" y2="56" stroke={c} strokeWidth={w}/>
      <line x1="14" y1="56" x2="10" y2="72" stroke={c} strokeWidth={w}/>
      <line x1="30" y1="56" x2="34" y2="72" stroke={c} strokeWidth={w}/>
      <line x1="62" y1="38" x2="75" y2="38" stroke={cL} strokeWidth="1.5" strokeDasharray="3,2"/>
      <polygon points="78,38 71,35 71,41" fill={cL}/>
      {/* Arme gespreizt */}
      <circle cx="95" cy="15" r="5" fill="none" stroke={c} strokeWidth={w}/>
      <line x1="95" y1="20" x2="90" y2="38" stroke={c} strokeWidth={w}/>
      <line x1="90" y1="30" x2="68" y2="18" stroke={c} strokeWidth={w}/>
      <line x1="90" y1="30" x2="112" y2="18" stroke={c} strokeWidth={w}/>
      <circle cx="65" cy="16" r="3" fill={c} opacity=".5"/>
      <circle cx="115" cy="16" r="3" fill={c} opacity=".5"/>
      <line x1="90" y1="38" x2="82" y2="56" stroke={c} strokeWidth={w}/>
      <line x1="90" y1="38" x2="98" y2="56" stroke={c} strokeWidth={w}/>
      <line x1="82" y1="56" x2="78" y2="72" stroke={c} strokeWidth={w}/>
      <line x1="98" y1="56" x2="102" y2="72" stroke={c} strokeWidth={w}/>
    </svg>,

    facepull:<svg viewBox="0 0 130 85" width="130" height="85" xmlns="http://www.w3.org/2000/svg">
      {/* Face Pulls: Kabel auf Kopfhöhe */}
      <rect x="2" y="12" width="12" height="50" rx="3" fill={c} opacity=".2"/>
      <circle cx="8" cy="28" r="5" fill="none" stroke={c} strokeWidth={w}/>
      <line x1="13" y1="28" x2="55" y2="28" stroke={c} strokeWidth="1.5" strokeDasharray="3,2" opacity=".5"/>
      <circle cx="55" cy="28" r="3" fill={c} opacity=".4"/>
      {/* Person – Arme gestreckt */}
      <circle cx="80" cy="18" r="5" fill="none" stroke={c} strokeWidth={w}/>
      <line x1="80" y1="23" x2="80" y2="45" stroke={c} strokeWidth={w}/>
      <line x1="65" y1="35" x2="95" y2="35" stroke={c} strokeWidth={wB} strokeLinecap="round"/>
      <line x1="65" y1="35" x2="57" y2="28" stroke={c} strokeWidth={w}/>
      <line x1="95" y1="35" x2="108" y2="22" stroke={c} strokeWidth={w}/>
      <line x1="80" y1="45" x2="70" y2="65" stroke={c} strokeWidth={w}/>
      <line x1="80" y1="45" x2="90" y2="65" stroke={c} strokeWidth={w}/>
      <line x1="70" y1="65" x2="67" y2="80" stroke={c} strokeWidth={w}/>
      <line x1="90" y1="65" x2="93" y2="80" stroke={c} strokeWidth={w}/>
      {/* Pfeil ziehen */}
      <line x1="60" y1="18" x2="72" y2="18" stroke={cL} strokeWidth="1.5" strokeDasharray="3,2"/>
      <polygon points="75,18 68,15 68,21" fill={cL}/>
      {/* Arme gebeugt – Ellbogen weit außen */}
      <line x1="65" y1="35" x2="48" y2="20" stroke={c} strokeWidth={w} opacity=".4"/>
      <line x1="95" y1="35" x2="112" y2="20" stroke={c} strokeWidth={w} opacity=".4"/>
    </svg>,

    // ── BIZEPS ─────────────────────────────────────────────────────────────
    bbcurl:<svg viewBox="0 0 160 90" width="160" height="90" xmlns="http://www.w3.org/2000/svg">
      {/* Bizepscurl: Arme gestreckt → oben gecurlt */}
      {/* Gestreckt */}
      <circle cx="32" cy="12" r="5" fill="none" stroke={c} strokeWidth={w}/>
      <line x1="32" y1="17" x2="32" y2="38" stroke={c} strokeWidth={w}/>
      <line x1="18" y1="28" x2="46" y2="28" stroke={c} strokeWidth={wB} strokeLinecap="round"/>
      <line x1="18" y1="28" x2="12" y2="55" stroke={c} strokeWidth={w}/>
      <line x1="46" y1="28" x2="52" y2="55" stroke={c} strokeWidth={w}/>
      <line x1="8" y1="58" x2="62" y2="58" stroke={c} strokeWidth={wB} strokeLinecap="round"/>
      <circle cx="5" cy="58" r="5" fill="none" stroke={c} strokeWidth={w}/><circle cx="65" cy="58" r="5" fill="none" stroke={c} strokeWidth={w}/>
      <line x1="32" y1="38" x2="22" y2="58" stroke={c} strokeWidth={w}/>
      <line x1="32" y1="38" x2="42" y2="58" stroke={c} strokeWidth={w}/>
      <line x1="22" y1="58" x2="18" y2="78" stroke={c} strokeWidth={w}/>
      <line x1="42" y1="58" x2="46" y2="78" stroke={c} strokeWidth={w}/>
      {/* Pfeil */}
      <line x1="80" y1="50" x2="80" y2="28" stroke={cL} strokeWidth="1.5" strokeDasharray="3,2"/>
      <polygon points="80,24 77,31 83,31" fill={cL}/>
      {/* Gecurlt */}
      <circle cx="118" cy="12" r="5" fill="none" stroke={c} strokeWidth={w}/>
      <line x1="118" y1="17" x2="118" y2="38" stroke={c} strokeWidth={w}/>
      <line x1="104" y1="28" x2="132" y2="28" stroke={c} strokeWidth={wB} strokeLinecap="round"/>
      {/* Unterarme gebeugt */}
      <line x1="104" y1="28" x2="96" y2="45" stroke={c} strokeWidth={w}/>
      <line x1="132" y1="28" x2="140" y2="45" stroke={c} strokeWidth={w}/>
      <line x1="96" y1="45" x2="100" y2="28" stroke={c} strokeWidth={w}/>
      <line x1="140" y1="45" x2="136" y2="28" stroke={c} strokeWidth={w}/>
      <line x1="96" y1="28" x2="142" y2="28" stroke={c} strokeWidth={wB} strokeLinecap="round"/>
      <circle cx="93" cy="28" r="5" fill="none" stroke={c} strokeWidth={w}/><circle cx="145" cy="28" r="5" fill="none" stroke={c} strokeWidth={w}/>
      <line x1="118" y1="38" x2="108" y2="58" stroke={c} strokeWidth={w}/>
      <line x1="118" y1="38" x2="128" y2="58" stroke={c} strokeWidth={w}/>
      <line x1="108" y1="58" x2="104" y2="78" stroke={c} strokeWidth={w}/>
      <line x1="128" y1="58" x2="132" y2="78" stroke={c} strokeWidth={w}/>
    </svg>,

    hammer:<svg viewBox="0 0 120 90" width="120" height="90" xmlns="http://www.w3.org/2000/svg">
      {/* Hammercurl: Daumen oben, seitlich gecurlt */}
      <circle cx="32" cy="12" r="5" fill="none" stroke={c} strokeWidth={w}/>
      <line x1="32" y1="17" x2="32" y2="38" stroke={c} strokeWidth={w}/>
      <line x1="18" y1="28" x2="46" y2="28" stroke={c} strokeWidth={wB} strokeLinecap="round"/>
      <line x1="18" y1="28" x2="14" y2="52" stroke={c} strokeWidth={w}/>
      <line x1="46" y1="28" x2="50" y2="52" stroke={c} strokeWidth={w}/>
      {/* Hantel vertikal (Daumen oben) */}
      <rect x="10" y="52" width="6" height="16" rx="3" fill={c} opacity=".5"/>
      <rect x="46" y="52" width="6" height="16" rx="3" fill={c} opacity=".5"/>
      <line x1="32" y1="38" x2="22" y2="58" stroke={c} strokeWidth={w}/>
      <line x1="32" y1="38" x2="42" y2="58" stroke={c} strokeWidth={w}/>
      <line x1="22" y1="58" x2="18" y2="78" stroke={c} strokeWidth={w}/>
      <line x1="42" y1="58" x2="46" y2="78" stroke={c} strokeWidth={w}/>
      {/* Gecurlt Seite 2 */}
      <line x1="65" y1="40" x2="80" y2="40" stroke={cL} strokeWidth="1.5" strokeDasharray="3,2"/>
      <polygon points="83,40 76,37 76,43" fill={cL}/>
      <circle cx="100" cy="12" r="5" fill="none" stroke={c} strokeWidth={w}/>
      <line x1="100" y1="17" x2="100" y2="38" stroke={c} strokeWidth={w}/>
      <line x1="86" y1="28" x2="114" y2="28" stroke={c} strokeWidth={wB} strokeLinecap="round"/>
      <line x1="86" y1="28" x2="80" y2="38" stroke={c} strokeWidth={w}/>
      <line x1="80" y1="38" x2="86" y2="28" stroke={c} strokeWidth={w}/>
      <line x1="114" y1="28" x2="120" y2="38" stroke={c} strokeWidth={w}/>
      <rect x="76" y="28" width="6" height="16" rx="3" fill={c} opacity=".5"/>
      <line x1="100" y1="38" x2="90" y2="58" stroke={c} strokeWidth={w}/>
      <line x1="100" y1="38" x2="110" y2="58" stroke={c} strokeWidth={w}/>
      <line x1="90" y1="58" x2="86" y2="78" stroke={c} strokeWidth={w}/>
      <line x1="110" y1="58" x2="114" y2="78" stroke={c} strokeWidth={w}/>
    </svg>,

    conc:<svg viewBox="0 0 100 90" width="100" height="90" xmlns="http://www.w3.org/2000/svg">
      {/* Konzentrationscurl: sitzend, Ellbogen am Oberschenkel */}
      {/* Sitzende Position */}
      <rect x="10" y="62" width="80" height="8" rx="4" fill={cL} opacity=".3"/>
      <circle cx="45" cy="20" r="5" fill="none" stroke={c} strokeWidth={w}/>
      <line x1="45" y1="25" x2="42" y2="42" stroke={c} strokeWidth={w}/>
      <line x1="42" y1="42" x2="28" y2="62" stroke={c} strokeWidth={w}/>
      <line x1="42" y1="42" x2="58" y2="62" stroke={c} strokeWidth={w}/>
      {/* Arm gestützt */}
      <line x1="42" y1="42" x2="34" y2="50" stroke={c} strokeWidth={w}/>
      <line x1="34" y1="50" x2="30" y2="68" stroke={c} strokeWidth={w}/>
      {/* Hantel unten */}
      <circle cx="28" cy="72" r="5" fill="none" stroke={c} strokeWidth={w}/>
      <line x1="23" y1="72" x2="33" y2="72" stroke={c} strokeWidth="3" strokeLinecap="round"/>
      {/* Pfeil gecurlt */}
      <line x1="18" y1="52" x2="8" y2="38" stroke={cL} strokeWidth="1.5" strokeDasharray="3,2"/>
      <polygon points="6,35 9,42 14,38" fill={cL}/>
      {/* Gecurlt */}
      <line x1="42" y1="42" x2="33" y2="35" stroke={c} strokeWidth={w} opacity=".5"/>
      <line x1="33" y1="35" x2="28" y2="28" stroke={c} strokeWidth={w} opacity=".5"/>
      <circle cx="26" cy="26" r="5" fill="none" stroke={c} strokeWidth={w} opacity=".4"/>
    </svg>,

    inccurl:<svg viewBox="0 0 120 95" width="120" height="95" xmlns="http://www.w3.org/2000/svg">
      {/* Schrägbankscurl */}
      <line x1="5" y1="88" x2="80" y2="40" stroke={c} strokeWidth="4" strokeLinecap="round" opacity=".3"/>
      <rect x="5" y="85" width="10" height="12" rx="2" fill={cL} opacity=".4"/>
      <circle cx="35" cy="30" r="5" fill="none" stroke={c} strokeWidth={w}/>
      <line x1="35" y1="35" x2="32" y2="52" stroke={c} strokeWidth={w}/>
      <line x1="32" y1="52" x2="22" y2="70" stroke={c} strokeWidth={w}/>
      <line x1="32" y1="52" x2="44" y2="65" stroke={c} strokeWidth={w}/>
      {/* Arm hängend */}
      <line x1="32" y1="44" x2="18" y2="52" stroke={c} strokeWidth={w}/>
      <line x1="18" y1="52" x2="12" y2="72" stroke={c} strokeWidth={w}/>
      <circle cx="10" cy="74" r="4" fill="none" stroke={c} strokeWidth={w}/>
      <line x1="6" y1="72" x2="14" y2="76" stroke={c} strokeWidth="3" strokeLinecap="round"/>
      {/* Gecurlt */}
      <line x1="65" y1="50" x2="78" y2="50" stroke={cL} strokeWidth="1.5" strokeDasharray="3,2"/>
      <polygon points="81,50 74,47 74,53" fill={cL}/>
      <circle cx="100" cy="30" r="5" fill="none" stroke={c} strokeWidth={w}/>
      <line x1="100" y1="35" x2="97" y2="52" stroke={c} strokeWidth={w}/>
      <line x1="97" y1="52" x2="87" y2="70" stroke={c} strokeWidth={w}/>
      <line x1="97" y1="52" x2="110" y2="65" stroke={c} strokeWidth={w}/>
      <line x1="97" y1="44" x2="86" y2="36" stroke={c} strokeWidth={w}/>
      <line x1="86" y1="36" x2="82" y2="24" stroke={c} strokeWidth={w}/>
      <circle cx="80" cy="22" r="4" fill="none" stroke={c} strokeWidth={w}/>
      <line x1="76" y1="22" x2="84" y2="22" stroke={c} strokeWidth="3" strokeLinecap="round"/>
    </svg>,

    // ── TRIZEPS ────────────────────────────────────────────────────────────
    tricpush:<svg viewBox="0 0 120 90" width="120" height="90" xmlns="http://www.w3.org/2000/svg">
      {/* Trizepsdrücken Kabel: Ellbogen oben → unten gestreckt */}
      <rect x="45" y="2" width="30" height="8" rx="3" fill={c} opacity=".3"/>
      <line x1="60" y1="10" x2="60" y2="28" stroke={c} strokeWidth="1.5" strokeDasharray="3,2" opacity=".5"/>
      <circle cx="60" cy="28" r="3" fill={c} opacity=".4"/>
      {/* Person */}
      <circle cx="60" cy="20" r="5" fill="none" stroke={c} strokeWidth={w}/>
      <line x1="60" y1="25" x2="60" y2="48" stroke={c} strokeWidth={w}/>
      <line x1="45" y1="38" x2="75" y2="38" stroke={c} strokeWidth={wB} strokeLinecap="round"/>
      {/* Arme gebeugt oben */}
      <line x1="45" y1="38" x2="42" y2="28" stroke={c} strokeWidth={w}/>
      <line x1="75" y1="38" x2="78" y2="28" stroke={c} strokeWidth={w}/>
      <line x1="42" y1="28" x2="50" y2="30" stroke={c} strokeWidth={w}/>
      <line x1="78" y1="28" x2="70" y2="30" stroke={c} strokeWidth={w}/>
      <line x1="60" y1="48" x2="50" y2="68" stroke={c} strokeWidth={w}/>
      <line x1="60" y1="48" x2="70" y2="68" stroke={c} strokeWidth={w}/>
      <line x1="50" y1="68" x2="47" y2="82" stroke={c} strokeWidth={w}/>
      <line x1="70" y1="68" x2="73" y2="82" stroke={c} strokeWidth={w}/>
      {/* Pfeil runter */}
      <line x1="20" y1="30" x2="20" y2="55" stroke={cL} strokeWidth="1.5" strokeDasharray="3,2"/>
      <polygon points="20,58 17,51 23,51" fill={cL}/>
      {/* Arme gestreckt unten */}
      <line x1="45" y1="38" x2="40" y2="60" stroke={c} strokeWidth={w} opacity=".5"/>
      <line x1="75" y1="38" x2="80" y2="60" stroke={c} strokeWidth={w} opacity=".5"/>
      <line x1="38" y1="60" x2="48" y2="60" stroke={c} strokeWidth={wB} strokeLinecap="round" opacity=".5"/>
      <circle cx="35" cy="60" r="3" fill={c} opacity=".3"/><circle cx="51" cy="60" r="3" fill={c} opacity=".3"/>
    </svg>,

    skull:<svg viewBox="0 0 120 80" width="120" height="80" xmlns="http://www.w3.org/2000/svg">
      {/* Skull Crusher: liegend, Stange runter → hoch */}
      <rect x="5" y="52" width="110" height="6" rx="3" fill={cL} opacity=".3"/>
      {/* Stange unten (zur Stirn) */}
      <circle cx="30" cy="44" r="5" fill="none" stroke={c} strokeWidth={w}/>
      <line x1="30" y1="49" x2="30" y2="52" stroke={c} strokeWidth={w}/>
      <line x1="30" y1="52" x2="24" y2="62" stroke={c} strokeWidth={w}/>
      <line x1="30" y1="52" x2="36" y2="60" stroke={c} strokeWidth={w}/>
      {/* Ellbogen oben, Unterarme zur Stirn */}
      <line x1="20" y1="44" x2="55" y2="44" stroke={c} strokeWidth={wB} strokeLinecap="round"/>
      <line x1="20" y1="44" x2="16" y2="32" stroke={c} strokeWidth={w}/>
      <line x1="55" y1="44" x2="52" y2="32" stroke={c} strokeWidth={w}/>
      <line x1="14" y1="25" x2="60" y2="25" stroke={c} strokeWidth={wB} strokeLinecap="round"/>
      <circle cx="11" cy="25" r="4" fill="none" stroke={c} strokeWidth={w}/><circle cx="63" cy="25" r="4" fill="none" stroke={c} strokeWidth={w}/>
      {/* Pfeil */}
      <line x1="70" y1="35" x2="85" y2="35" stroke={cL} strokeWidth="1.5" strokeDasharray="3,2"/>
      <polygon points="88,35 81,32 81,38" fill={cL}/>
      {/* Stange oben (gestreckt) */}
      <circle cx="95" cy="44" r="5" fill="none" stroke={c} strokeWidth={w}/>
      <line x1="95" y1="49" x2="95" y2="52" stroke={c} strokeWidth={w}/>
      <line x1="95" y1="52" x2="89" y2="62" stroke={c} strokeWidth={w}/>
      <line x1="95" y1="52" x2="101" y2="60" stroke={c} strokeWidth={w}/>
      <line x1="85" y1="44" x2="120" y2="44" stroke={c} strokeWidth={wB} strokeLinecap="round"/>
      <line x1="85" y1="44" x2="82" y2="18" stroke={c} strokeWidth={w}/>
      <line x1="120" y1="44" x2="118" y2="18" stroke={c} strokeWidth={w}/>
      <line x1="78" y1="12" x2="124" y2="12" stroke={c} strokeWidth={wB} strokeLinecap="round"/>
      <circle cx="75" cy="12" r="4" fill="none" stroke={c} strokeWidth={w}/><circle cx="127" cy="12" r="4" fill="none" stroke={c} strokeWidth={w}/>
    </svg>,

    tricdip:<svg viewBox="0 0 100 90" width="100" height="90" xmlns="http://www.w3.org/2000/svg">
      {/* Dips Trizeps: aufrecht an Bank */}
      <rect x="5" y="58" width="90" height="8" rx="4" fill={cL} opacity=".3"/>
      <rect x="60" y="38" width="35" height="8" rx="4" fill={cL} opacity=".35"/>
      {/* Person oben gestreckt */}
      <circle cx="38" cy="18" r="5" fill="none" stroke={c} strokeWidth={w}/>
      <line x1="38" y1="23" x2="38" y2="42" stroke={c} strokeWidth={w}/>
      <line x1="25" y1="35" x2="68" y2="35" stroke={c} strokeWidth={wB} strokeLinecap="round"/>
      <line x1="25" y1="35" x2="20" y2="58" stroke={c} strokeWidth={w}/>
      <line x1="68" y1="35" x2="68" y2="42" stroke={c} strokeWidth={w}/>
      <line x1="38" y1="42" x2="30" y2="58" stroke={c} strokeWidth={w}/>
      <line x1="38" y1="42" x2="46" y2="58" stroke={c} strokeWidth={w}/>
      <line x1="30" y1="58" x2="28" y2="74" stroke={c} strokeWidth={w}/>
      <line x1="46" y1="58" x2="48" y2="74" stroke={c} strokeWidth={w}/>
      {/* Pfeil runter */}
      <line x1="8" y1="30" x2="8" y2="52" stroke={cL} strokeWidth="1.5" strokeDasharray="3,2"/>
      <polygon points="8,55 5,48 11,48" fill={cL}/>
      {/* Tief abgesenkt */}
      <circle cx="80" cy="28" r="5" fill="none" stroke={c} strokeWidth={w}/>
      <line x1="80" y1="33" x2="80" y2="50" stroke={c} strokeWidth={w}/>
      <line x1="68" y1="42" x2="94" y2="42" stroke={c} strokeWidth={wB} strokeLinecap="round"/>
      <line x1="68" y1="42" x2="62" y2="58" stroke={c} strokeWidth={w}/>
      <line x1="94" y1="42" x2="94" y2="58" stroke={c} strokeWidth={w}/>
      <line x1="80" y1="50" x2="72" y2="66" stroke={c} strokeWidth={w}/>
      <line x1="80" y1="50" x2="88" y2="66" stroke={c} strokeWidth={w}/>
      <line x1="72" y1="66" x2="70" y2="80" stroke={c} strokeWidth={w}/>
      <line x1="88" y1="66" x2="90" y2="80" stroke={c} strokeWidth={w}/>
    </svg>,

    tricoverhead:<svg viewBox="0 0 120 95" width="120" height="95" xmlns="http://www.w3.org/2000/svg">
      {/* Überkopf Trizeps: Hantel hinter Kopf → gestreckt */}
      {/* Gebeugt (hinter Kopf) */}
      <circle cx="32" cy="15" r="5" fill="none" stroke={c} strokeWidth={w}/>
      <line x1="32" y1="20" x2="32" y2="42" stroke={c} strokeWidth={w}/>
      <line x1="18" y1="32" x2="46" y2="32" stroke={c} strokeWidth={wB} strokeLinecap="round"/>
      {/* Ellbogen oben, Unterarm hinter Kopf */}
      <line x1="18" y1="32" x2="16" y2="18" stroke={c} strokeWidth={w}/>
      <line x1="46" y1="32" x2="48" y2="18" stroke={c} strokeWidth={w}/>
      <line x1="16" y1="18" x2="32" y2="38" stroke={c} strokeWidth={w}/>
      <line x1="48" y1="18" x2="32" y2="38" stroke={c} strokeWidth={w}/>
      <circle cx="32" cy="42" r="6" fill="none" stroke={c} strokeWidth={w} opacity=".3"/>
      <line x1="26" y1="42" x2="38" y2="42" stroke={c} strokeWidth="3" strokeLinecap="round" opacity=".5"/>
      <line x1="32" y1="42" x2="22" y2="62" stroke={c} strokeWidth={w}/>
      <line x1="32" y1="42" x2="42" y2="62" stroke={c} strokeWidth={w}/>
      <line x1="22" y1="62" x2="18" y2="80" stroke={c} strokeWidth={w}/>
      <line x1="42" y1="62" x2="46" y2="80" stroke={c} strokeWidth={w}/>
      {/* Pfeil */}
      <line x1="65" y1="40" x2="78" y2="40" stroke={cL} strokeWidth="1.5" strokeDasharray="3,2"/>
      <polygon points="81,40 74,37 74,43" fill={cL}/>
      {/* Gestreckt (Hantel oben) */}
      <circle cx="100" cy="15" r="5" fill="none" stroke={c} strokeWidth={w}/>
      <line x1="100" y1="20" x2="100" y2="42" stroke={c} strokeWidth={w}/>
      <line x1="86" y1="32" x2="114" y2="32" stroke={c} strokeWidth={wB} strokeLinecap="round"/>
      {/* Arme gestreckt nach oben */}
      <line x1="86" y1="32" x2="84" y2="8" stroke={c} strokeWidth={w}/>
      <line x1="114" y1="32" x2="116" y2="8" stroke={c} strokeWidth={w}/>
      <line x1="80" y1="4" x2="120" y2="4" stroke={c} strokeWidth={wB} strokeLinecap="round"/>
      <circle cx="77" cy="4" r="4" fill="none" stroke={c} strokeWidth={w}/><circle cx="123" cy="4" r="4" fill="none" stroke={c} strokeWidth={w}/>
      <line x1="100" y1="42" x2="90" y2="62" stroke={c} strokeWidth={w}/>
      <line x1="100" y1="42" x2="110" y2="62" stroke={c} strokeWidth={w}/>
      <line x1="90" y1="62" x2="86" y2="80" stroke={c} strokeWidth={w}/>
      <line x1="110" y1="62" x2="114" y2="80" stroke={c} strokeWidth={w}/>
    </svg>,

    default:<svg viewBox="0 0 80 80" width="80" height="80" xmlns="http://www.w3.org/2000/svg">
      <circle cx="40" cy="14" r="7" fill="none" stroke={c} strokeWidth={w}/>
      <line x1="40" y1="21" x2="40" y2="45" stroke={c} strokeWidth={wB}/>
      <line x1="40" y1="32" x2="22" y2="42" stroke={c} strokeWidth={w}/>
      <line x1="40" y1="32" x2="58" y2="42" stroke={c} strokeWidth={w}/>
      <line x1="40" y1="45" x2="28" y2="68" stroke={c} strokeWidth={w}/>
      <line x1="40" y1="45" x2="52" y2="68" stroke={c} strokeWidth={w}/>
      <line x1="28" y1="68" x2="24" y2="80" stroke={c} strokeWidth={w}/>
      <line x1="52" y1="68" x2="56" y2="80" stroke={c} strokeWidth={w}/>
    </svg>,
  };
  return sketches[type]||sketches.default;
}

function WorkoutTab({workoutPlans,workoutLog,saveWorkoutPlans,saveWorkoutLog,showNotif}){
  const[view,setView]=useState("plans"); // plans | create | detail | logSession | templates | progress
  const[sel,setSel]=useState(null);
  const[newPlan,setNewPlan]=useState({name:"",days:[{name:"Tag A",exercises:[]}]});
  const[dayIdx,setDayIdx]=useState(0);
  const[sessionSets,setSessionSets]=useState({}); // {exId: [{weight:"", reps:"", done:false}]}
  const[templateMuscle,setTemplateMuscle]=useState("Brust");
  const[progressEx,setProgressEx]=useState(null); // exercise name to show progress for
  const[customExName,setCustomExName]=useState("");
  const[customExNote,setCustomExNote]=useState("");
  const[customExEmoji,setCustomExEmoji]=useState("🏋️");

  const iS={width:"100%",background:"#f5f0e8",border:"1.5px solid #d4c9a8",borderRadius:12,padding:"11px 14px",color:"#2c2416",fontSize:16,marginBottom:10,fontFamily:"'DM Sans',sans-serif"};
  const lf="#4a7c59",lfs="#e8f0e9",bdr="#d4c9a8",tx="#2c2416",mu="#8c7d65",sf="#faf8f2",bg="#f5f0e8";
  const card={background:sf,borderRadius:18,padding:"14px 16px",border:`1px solid ${bdr}`,boxShadow:"0 2px 16px rgba(74,124,89,0.10)",marginBottom:12};
  const backBtn=(label="← Zurück",action=()=>{setView("plans");setSel(null);})=>(
    <button onClick={action} style={{background:bg,border:`1px solid ${bdr}`,borderRadius:10,color:mu,padding:"7px 14px",fontSize:13,fontWeight:600}}>{label}</button>
  );

  // Helpers
  const createPlan=()=>{
    if(!newPlan.name.trim())return;
    saveWorkoutPlans([...workoutPlans,{...newPlan,id:Date.now(),createdAt:new Date().toISOString()}]);
    setView("plans");setNewPlan({name:"",days:[{name:"Tag A",exercises:[]}]});
    showNotif("✅ Plan erstellt!");
  };
  const delPlan=id=>{saveWorkoutPlans(workoutPlans.filter(p=>p.id!==id));showNotif("🗑️ Gelöscht","err");};

  const addExFromTemplate=(tmpl)=>{
    const p=JSON.parse(JSON.stringify(sel));
    const ex={id:Date.now(),name:tmpl.name,emoji:tmpl.emoji,note:tmpl.tips,sets:3,reps:"8–12",weight:"",sketchType:tmpl.svg};
    p.days[dayIdx].exercises=[...(p.days[dayIdx].exercises||[]),ex];
    saveWorkoutPlans(workoutPlans.map(wp=>wp.id===p.id?p:wp));
    setSel(p);setView("detail");
    showNotif(`✅ ${tmpl.name} hinzugefügt!`);
  };

  const addCustomEx=()=>{
    if(!customExName.trim())return;
    const p=JSON.parse(JSON.stringify(sel));
    const ex={id:Date.now(),name:customExName,emoji:customExEmoji,note:customExNote,sets:3,reps:"8–12",weight:"",sketchType:"default"};
    p.days[dayIdx].exercises=[...(p.days[dayIdx].exercises||[]),ex];
    saveWorkoutPlans(workoutPlans.map(wp=>wp.id===p.id?p:wp));
    setSel(p);setCustomExName("");setCustomExNote("");
    showNotif("✅ Eigene Übung hinzugefügt!");
  };

  const remEx=(di,eid)=>{
    const p=JSON.parse(JSON.stringify(sel));
    p.days[di].exercises=p.days[di].exercises.filter(e=>e.id!==eid);
    saveWorkoutPlans(workoutPlans.map(wp=>wp.id===p.id?p:wp));setSel(p);
  };

  // Session: init sets for each exercise
  const initSession=(exercises)=>{
    const s={};
    exercises.forEach(ex=>{
      const count=ex.sets||3;
      s[ex.id]=Array.from({length:count},()=>({weight:ex.weight||"",reps:ex.reps||"",done:false}));
    });
    setSessionSets(s);
  };

  const updateSet=(exId,setIdx,field,val)=>{
    setSessionSets(prev=>({...prev,[exId]:prev[exId].map((s,i)=>i===setIdx?{...s,[field]:val}:s)}));
  };

  const toggleSetDone=(exId,setIdx)=>{
    setSessionSets(prev=>({...prev,[exId]:prev[exId].map((s,i)=>i===setIdx?{...s,done:!s.done}:s)}));
  };

  const addSet=(exId)=>setSessionSets(prev=>({...prev,[exId]:[...prev[exId],{weight:prev[exId][prev[exId].length-1]?.weight||"",reps:prev[exId][prev[exId].length-1]?.reps||"",done:false}]}));
  const removeSet=(exId)=>setSessionSets(prev=>({...prev,[exId]:prev[exId].length>1?prev[exId].slice(0,-1):prev[exId]}));

  const logSession=()=>{
    const today=new Date().toDateString();
    const exercises=(sel.days[dayIdx].exercises||[]).map(ex=>({
      ...ex,
      sets:sessionSets[ex.id]||[],
    }));
    const entry={planId:sel.id,planName:sel.name,dayName:sel.days[dayIdx].name,exercises,date:today,timestamp:Date.now()};
    const wl={...workoutLog};
    if(!wl[today])wl[today]=[];
    wl[today].push(entry);
    saveWorkoutLog(wl);
    showNotif("🎉 Training gespeichert!");
    setView("plans");
  };

  // Progress: find all logged weights for an exercise
  const getProgress=(exName)=>{
    const points=[];
    Object.entries(workoutLog).forEach(([dk,sessions])=>{
      sessions.forEach(s=>{
        s.exercises?.forEach(ex=>{
          if(ex.name===exName&&ex.sets?.length){
            const maxW=Math.max(...ex.sets.map(st=>parseFloat(st.weight)||0).filter(v=>v>0));
            if(maxW>0)points.push({date:dk,weight:maxW});
          }
        });
      });
    });
    return points.sort((a,b)=>new Date(a.date)-new Date(b.date));
  };

  const last14=Array.from({length:14},(_,i)=>{const d=new Date();d.setDate(d.getDate()-(13-i));const key=d.toDateString();return{label:d.toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit"}),count:(workoutLog[key]||[]).length};});
  const maxC=Math.max(1,...last14.map(d=>d.count));
  const emos=["🏋️","💪","🦵","🔥","⚡","🎯","🤸","🏃","🚴","🧗","🥊","🤼"];

  // ── VIEW: CREATE PLAN ──────────────────────────────────────────────────────
  if(view==="create")return<div>
    <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
      {backBtn()}
      <div style={{fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:800,color:tx}}>Neuer Plan</div>
    </div>
    <input style={iS} placeholder="Planname (z.B. Push/Pull/Legs)" value={newPlan.name} onChange={e=>setNewPlan(p=>({...p,name:e.target.value}))} autoFocus/>
    <div style={{fontSize:10,color:mu,fontWeight:700,marginBottom:10,textTransform:"uppercase",letterSpacing:.5}}>Trainingstage</div>
    {newPlan.days.map((day,di)=><div key={di} style={{display:"flex",gap:8,marginBottom:8}}>
      <input style={{...iS,flex:1,marginBottom:0}} value={day.name} onChange={e=>{const days=[...newPlan.days];days[di].name=e.target.value;setNewPlan(p=>({...p,days}));}} placeholder={`Tag ${di+1}`}/>
      {newPlan.days.length>1&&<button onClick={()=>setNewPlan(p=>({...p,days:p.days.filter((_,i)=>i!==di)}))} style={{background:"#fff0f0",border:"1px solid #f5b8b8",borderRadius:10,color:"#c0392b",padding:"0 12px",fontSize:14}}>✕</button>}
    </div>)}
    <button onClick={()=>setNewPlan(p=>({...p,days:[...p.days,{name:`Tag ${p.days.length+1}`,exercises:[]}]}))} style={{width:"100%",background:bg,border:`1.5px dashed ${bdr}`,borderRadius:12,color:mu,padding:12,fontSize:13,marginBottom:16}}>+ Tag hinzufügen</button>
    <button onClick={createPlan} disabled={!newPlan.name.trim()} style={{width:"100%",background:`linear-gradient(135deg,${lf},#3d6b4a)`,borderRadius:14,padding:14,color:"#fff",fontSize:15,fontWeight:700,border:"none",opacity:!newPlan.name.trim()?.5:1}}>✅ Plan erstellen</button>
  </div>;

  // ── VIEW: ÜBUNGSVORLAGEN ───────────────────────────────────────────────────
  if(view==="templates")return<div>
    <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
      {backBtn("← Zurück",()=>setView("detail"))}
      <div style={{fontFamily:"'Playfair Display',serif",fontSize:15,fontWeight:800,color:tx}}>Übungsvorlagen</div>
    </div>
    {/* Muskelgruppen-Tabs */}
    <div style={{display:"flex",gap:6,overflowX:"auto",marginBottom:14,paddingBottom:2}}>
      {Object.keys(EXERCISE_TEMPLATES).map(m=>(
        <button key={m} onClick={()=>setTemplateMuscle(m)} style={{flexShrink:0,padding:"8px 14px",borderRadius:10,fontSize:12,fontWeight:700,background:templateMuscle===m?lf:bg,color:templateMuscle===m?"#fff":mu,border:`1.5px solid ${templateMuscle===m?lf:bdr}`}}>
          {m}
        </button>
      ))}
    </div>
    {/* Übungen der gewählten Gruppe */}
    {EXERCISE_TEMPLATES[templateMuscle].map((tmpl,i)=>(
      <div key={i} style={card}>
        <div style={{display:"flex",gap:12,alignItems:"flex-start",marginBottom:10}}>
          <div style={{background:lfs,borderRadius:12,padding:8,flexShrink:0}}>
            <ExerciseSketch type={tmpl.svg}/>
          </div>
          <div style={{flex:1}}>
            <div style={{fontSize:14,fontWeight:800,color:tx,marginBottom:4}}>{tmpl.emoji} {tmpl.name}</div>
            <div style={{fontSize:12,color:tx,lineHeight:1.6,marginBottom:6}}>{tmpl.desc}</div>
            <div style={{background:"#faf2db",borderRadius:8,padding:"6px 10px",fontSize:11,color:"#7a6000",lineHeight:1.5}}>
              💡 {tmpl.tips}
            </div>
          </div>
        </div>
        <button onClick={()=>addExFromTemplate(tmpl)} style={{width:"100%",background:`linear-gradient(135deg,${lf},#3d6b4a)`,borderRadius:12,padding:"11px",color:"#fff",fontSize:13,fontWeight:700,border:"none"}}>
          + Zu {sel?.days[dayIdx]?.name||"Plan"} hinzufügen
        </button>
      </div>
    ))}
    {/* Eigene Übung hinzufügen */}
    <div style={{...card,border:`1.5px dashed ${bdr}`,marginTop:4}}>
      <div style={{fontSize:11,color:mu,fontWeight:700,marginBottom:12,textTransform:"uppercase",letterSpacing:.5}}>✏️ Eigene Übung erstellen</div>
      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>
        {emos.map(em=><button key={em} onClick={()=>setCustomExEmoji(em)} style={{background:customExEmoji===em?lfs:sf,border:`1.5px solid ${customExEmoji===em?lf:bdr}`,borderRadius:8,padding:"6px 9px",fontSize:20}}>{em}</button>)}
      </div>
      <input style={iS} placeholder="Übungsname" value={customExName} onChange={e=>setCustomExName(e.target.value)}/>
      <input style={iS} placeholder="Hinweis / Beschreibung (optional)" value={customExNote} onChange={e=>setCustomExNote(e.target.value)}/>
      <button onClick={addCustomEx} disabled={!customExName.trim()} style={{width:"100%",background:`linear-gradient(135deg,${lf},#3d6b4a)`,borderRadius:12,padding:13,color:"#fff",fontSize:14,fontWeight:700,border:"none",opacity:!customExName.trim()?.5:1}}>
        + Eigene Übung hinzufügen
      </button>
    </div>
  </div>;

  // ── VIEW: PLAN DETAIL ──────────────────────────────────────────────────────
  if(view==="detail"&&sel)return<div>
    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
      {backBtn()}
      <div style={{fontFamily:"'Playfair Display',serif",fontSize:15,fontWeight:800,flex:1,color:tx}}>{sel.name}</div>
      <button onClick={()=>{const ex=sel.days[dayIdx].exercises||[];initSession(ex);setView("logSession");}} style={{background:lfs,border:`1px solid ${lf}44`,borderRadius:10,color:lf,padding:"7px 14px",fontSize:12,fontWeight:700}}>▶ Start</button>
    </div>
    {/* Tag-Tabs */}
    <div style={{display:"flex",gap:7,marginBottom:14,overflowX:"auto"}}>
      {sel.days.map((day,i)=><button key={i} onClick={()=>setDayIdx(i)} style={{flexShrink:0,padding:"7px 16px",borderRadius:10,fontSize:12,fontWeight:700,background:dayIdx===i?lf:bg,color:dayIdx===i?"#fff":mu,border:`1.5px solid ${dayIdx===i?lf:bdr}`}}>{day.name}</button>)}
    </div>
    {/* Übungen des Tages */}
    {(sel.days[dayIdx].exercises||[]).length===0&&(
      <div style={{textAlign:"center",padding:"28px 0",color:mu}}>
        <div style={{fontSize:40,marginBottom:8}}>🏋️</div>
        <div style={{fontSize:13}}>Noch keine Übungen für diesen Tag</div>
      </div>
    )}
    {(sel.days[dayIdx].exercises||[]).map((ex,ei)=>(
      <div key={ex.id} style={card}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          {ex.sketchType&&<div style={{background:lfs,borderRadius:10,padding:6,flexShrink:0}}><ExerciseSketch type={ex.sketchType}/></div>}
          {!ex.sketchType&&<span style={{fontSize:24}}>{ex.emoji}</span>}
          <div style={{flex:1}}>
            <div style={{fontSize:13,fontWeight:700,color:tx}}>{ex.name}</div>
            <div style={{fontSize:11,color:mu,marginTop:1}}>{ex.sets} Sätze × {ex.reps}{ex.weight?` · ${ex.weight} kg`:""}</div>
            {ex.note&&<div style={{fontSize:10,color:"#7a6000",marginTop:3,background:"#faf2db",padding:"4px 8px",borderRadius:6}}>{ex.note}</div>}
          </div>
          <button onClick={()=>remEx(dayIdx,ex.id)} style={{background:"none",color:mu,fontSize:16,padding:4,flexShrink:0}}>✕</button>
        </div>
      </div>
    ))}
    {/* Übung hinzufügen */}
    <button onClick={()=>setView("templates")} style={{width:"100%",background:`linear-gradient(135deg,${lf},#3d6b4a)`,borderRadius:14,padding:14,color:"#fff",fontSize:14,fontWeight:700,border:"none",marginTop:4,boxShadow:`0 4px 16px ${lf}44`}}>
      📚 Übungsvorlagen öffnen
    </button>
  </div>;

  // ── VIEW: TRAINING SESSION ─────────────────────────────────────────────────
  if(view==="logSession"&&sel){
    const dayEx=sel.days[dayIdx].exercises||[];
    const totalDone=Object.values(sessionSets).flat().filter(s=>s.done).length;
    const totalSets=Object.values(sessionSets).flat().length;
    return<div>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
        {backBtn("← Zurück",()=>setView("detail"))}
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:15,fontWeight:800,color:tx}}>🏋️ Training</div>
        <div style={{marginLeft:"auto",fontSize:12,fontWeight:700,color:lf}}>{totalDone}/{totalSets} Sätze</div>
      </div>
      {/* Progress bar */}
      <div style={{height:5,background:bdr,borderRadius:3,marginBottom:14,overflow:"hidden"}}>
        <div style={{height:"100%",background:`linear-gradient(90deg,${lf},#5c8f5a)`,borderRadius:3,width:totalSets?`${(totalDone/totalSets)*100}%`:"0%",transition:"width .4s"}}/>
      </div>
      <div style={{...card,background:lfs,border:`1px solid ${lf}44`,marginBottom:16}}>
        <div style={{fontWeight:700,fontSize:14,color:tx}}>{sel.name} · {sel.days[dayIdx].name}</div>
        <div style={{fontSize:11,color:mu,marginTop:2}}>{dayEx.length} Übungen</div>
      </div>
      {dayEx.map(ex=>{
        const sets=sessionSets[ex.id]||[];
        return(
          <div key={ex.id} style={card}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
              <span style={{fontSize:22}}>{ex.emoji}</span>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:700,color:tx}}>{ex.name}</div>
                {ex.note&&<div style={{fontSize:10,color:"#7a6000",marginTop:2}}>{ex.note}</div>}
              </div>
            </div>
            {/* Satz-Tabelle Header */}
            <div style={{display:"grid",gridTemplateColumns:"28px 1fr 1fr 36px",gap:6,marginBottom:6}}>
              <div style={{fontSize:10,color:mu,fontWeight:700,textAlign:"center"}}>Satz</div>
              <div style={{fontSize:10,color:mu,fontWeight:700,textAlign:"center"}}>kg</div>
              <div style={{fontSize:10,color:mu,fontWeight:700,textAlign:"center"}}>Wdh.</div>
              <div/>
            </div>
            {/* Sätze */}
            {sets.map((s,si)=>(
              <div key={si} style={{display:"grid",gridTemplateColumns:"28px 1fr 1fr 36px",gap:6,marginBottom:7,alignItems:"center"}}>
                <div style={{fontSize:12,fontWeight:700,color:s.done?lf:mu,textAlign:"center",background:s.done?lfs:"transparent",borderRadius:6,padding:"4px 0"}}>{si+1}</div>
                <input
                  type="number" inputMode="decimal"
                  value={s.weight} placeholder="kg"
                  onChange={e=>updateSet(ex.id,si,"weight",e.target.value)}
                  style={{background:s.done?"#e8f0e9":bg,border:`1.5px solid ${s.done?lf:bdr}`,borderRadius:10,padding:"9px 10px",color:tx,fontSize:15,fontWeight:700,fontFamily:"inherit",textAlign:"center",width:"100%"}}
                />
                <input
                  type="text" inputMode="decimal"
                  value={s.reps} placeholder="Wdh."
                  onChange={e=>updateSet(ex.id,si,"reps",e.target.value)}
                  style={{background:s.done?"#e8f0e9":bg,border:`1.5px solid ${s.done?lf:bdr}`,borderRadius:10,padding:"9px 10px",color:tx,fontSize:15,fontWeight:700,fontFamily:"inherit",textAlign:"center",width:"100%"}}
                />
                <button onClick={()=>toggleSetDone(ex.id,si)} style={{background:s.done?lf:bg,border:`1.5px solid ${s.done?lf:bdr}`,borderRadius:10,padding:"9px 4px",fontSize:14,color:s.done?"#fff":mu,width:"100%"}}>
                  {s.done?"✓":"○"}
                </button>
              </div>
            ))}
            {/* + / - Sätze */}
            <div style={{display:"flex",gap:8,marginTop:4}}>
              <button onClick={()=>removeSet(ex.id)} style={{flex:1,background:bg,border:`1px solid ${bdr}`,borderRadius:9,padding:"7px",fontSize:18,color:mu}}>−</button>
              <div style={{flex:2,textAlign:"center",fontSize:11,color:mu,padding:"7px 0",fontWeight:600}}>{sets.length} {sets.length===1?"Satz":"Sätze"}</div>
              <button onClick={()=>addSet(ex.id)} style={{flex:1,background:lfs,border:`1px solid ${lf}44`,borderRadius:9,padding:"7px",fontSize:18,color:lf}}>+</button>
            </div>
          </div>
        );
      })}
      <button onClick={logSession} style={{width:"100%",background:`linear-gradient(135deg,${lf},#5c8f5a)`,borderRadius:14,padding:15,color:"#fff",fontSize:15,fontWeight:700,border:"none",marginTop:4,boxShadow:`0 4px 16px ${lf}44`}}>
        🎉 Training abschließen
      </button>
    </div>;
  }

  // ── VIEW: FORTSCHRITT ──────────────────────────────────────────────────────
  if(view==="progress"){
    const allExNames=[...new Set(Object.values(workoutLog).flat().flatMap(s=>s.exercises?.map(e=>e.name)||[]))];
    const pts=progressEx?getProgress(progressEx):[];
    const W=300,H=100,PX=30,PY=10;
    const minV=pts.length?Math.min(...pts.map(p=>p.weight))-2:0;
    const maxV=pts.length?Math.max(...pts.map(p=>p.weight))+2:100;
    const range=maxV-minV||1;
    const iW=W-PX*2,iH=H-PY*2;
    const px2=(i)=>PX+i*(iW/Math.max(pts.length-1,1));
    const py2=(v)=>PY+iH-(v-minV)/range*iH;
    return<div>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
        {backBtn("← Zurück",()=>setView("plans"))}
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:15,fontWeight:800,color:tx}}>📈 Trainingsfortschritt</div>
      </div>
      <div style={{...card,marginBottom:16}}>
        <div style={{fontSize:11,color:mu,fontWeight:700,marginBottom:10,textTransform:"uppercase",letterSpacing:.5}}>Übung auswählen</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
          {allExNames.length===0&&<div style={{fontSize:12,color:mu}}>Noch keine Trainingseinheiten gespeichert.</div>}
          {allExNames.map(n=>(
            <button key={n} onClick={()=>setProgressEx(n)} style={{padding:"7px 12px",borderRadius:10,fontSize:12,fontWeight:700,background:progressEx===n?lf:bg,color:progressEx===n?"#fff":mu,border:`1.5px solid ${progressEx===n?lf:bdr}`}}>{n}</button>
          ))}
        </div>
      </div>
      {progressEx&&pts.length>=2&&(
        <div style={card}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
            <div style={{fontSize:13,fontWeight:700,color:tx}}>{progressEx}</div>
            <div style={{fontSize:12,color:lf,fontWeight:700}}>{pts[pts.length-1].weight} kg aktuell</div>
          </div>
          <div style={{fontSize:11,color:mu,marginBottom:8}}>
            {pts.length} Einheiten · Start: {pts[0].weight} kg · {pts[pts.length-1].weight-pts[0].weight>=0?"+":""}{(pts[pts.length-1].weight-pts[0].weight).toFixed(1)} kg
          </div>
          <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{overflow:"visible"}}>
            <defs>
              <linearGradient id="pGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={lf} stopOpacity="0.2"/>
                <stop offset="100%" stopColor={lf} stopOpacity="0"/>
              </linearGradient>
            </defs>
            {[0,0.5,1].map((t,i)=>{
              const y=PY+iH*t;
              const v=(maxV-range*t).toFixed(1);
              return<g key={i}><line x1={PX} y1={y} x2={W-PX} y2={y} stroke={bdr} strokeWidth="1" strokeDasharray="3,3"/><text x={PX-4} y={y+4} fontSize="8" fill={mu} textAnchor="end">{v}</text></g>;
            })}
            <polygon points={`${px2(0)},${PY+iH} ${pts.map((_,i)=>`${px2(i)},${py2(pts[i].weight)}`).join(" ")} ${px2(pts.length-1)},${PY+iH}`} fill="url(#pGrad)"/>
            <polyline points={pts.map((_,i)=>`${px2(i)},${py2(pts[i].weight)}`).join(" ")} fill="none" stroke={lf} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            {pts.map((p,i)=>(
              <g key={i}>
                <circle cx={px2(i)} cy={py2(p.weight)} r="4" fill={lf} stroke="white" strokeWidth="2"/>
                {(i===0||i===pts.length-1)&&<text x={px2(i)} y={H+2} fontSize="7" fill={mu} textAnchor="middle">{new Date(p.date).toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit"})}</text>}
              </g>
            ))}
          </svg>
        </div>
      )}
      {progressEx&&pts.length<2&&(
        <div style={{...card,textAlign:"center",color:mu,padding:30}}>
          <div style={{fontSize:32,marginBottom:8}}>📊</div>
          <div style={{fontSize:13}}>Mindestens 2 Einheiten mit Gewicht nötig</div>
        </div>
      )}
    </div>;
  }

  // ── VIEW: PLAN ÜBERSICHT ───────────────────────────────────────────────────
  return<div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
      <div style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:800,color:tx}}>🏋️ Training</div>
      <div style={{display:"flex",gap:8}}>
        <button onClick={()=>setView("progress")} style={{background:bg,border:`1px solid ${bdr}`,borderRadius:10,color:mu,padding:"8px 12px",fontSize:12,fontWeight:700}}>📈</button>
        <button onClick={()=>setView("create")} style={{background:lfs,border:`1px solid ${lf}44`,borderRadius:10,color:lf,padding:"8px 16px",fontSize:12,fontWeight:700}}>+ Neuer Plan</button>
      </div>
    </div>
    {/* 14-Tage-Chart */}
    {Object.keys(workoutLog).length>0&&<div style={card}>
      <div style={{fontSize:10,color:mu,fontWeight:700,letterSpacing:.5,marginBottom:12,textTransform:"uppercase"}}>Training letzte 14 Tage</div>
      <div style={{display:"flex",alignItems:"flex-end",gap:3,height:52}}>
        {last14.map((d,i)=><div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
          <div style={{width:"100%",borderRadius:"3px 3px 0 0",background:d.count>0?lf:bdr,height:`${(d.count/maxC)*44+(d.count>0?8:0)}px`,minHeight:4,transition:"height .4s"}}/>
          {i%4===0&&<div style={{fontSize:8,color:mu}}>{d.label.split(".")[0]}</div>}
        </div>)}
      </div>
    </div>}
    {/* Pläne */}
    {workoutPlans.length===0?(
      <div style={{...card,textAlign:"center",padding:40,border:`1.5px dashed ${bdr}`}}>
        <div style={{fontSize:44,marginBottom:10}}>🏋️</div>
        <div style={{color:mu}}>Erstelle deinen ersten Plan</div>
      </div>
    ):workoutPlans.map(plan=>(
      <div key={plan.id} style={card}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div style={{flex:1,cursor:"pointer",minWidth:0}} onClick={()=>{setSel(plan);setDayIdx(0);setView("detail");}}>
            <div style={{fontSize:14,fontWeight:700,color:tx}}>{plan.name}</div>
            <div style={{fontSize:11,color:mu,marginTop:2}}>{plan.days.length} Tage · {plan.days.reduce((s,d)=>s+(d.exercises||[]).length,0)} Übungen</div>
            <div style={{display:"flex",gap:5,marginTop:8,flexWrap:"wrap"}}>
              {plan.days.map((d,i)=><span key={i} style={{background:bg,borderRadius:6,padding:"2px 9px",fontSize:10,color:mu,border:`1px solid ${bdr}`,fontWeight:600}}>{d.name}</span>)}
            </div>
          </div>
          <div style={{display:"flex",gap:8,marginLeft:10,flexShrink:0}}>
            <button onClick={()=>{setSel(plan);setDayIdx(0);setView("detail");}} style={{background:lfs,border:`1px solid ${lf}44`,borderRadius:9,color:lf,padding:"7px 12px",fontSize:11,fontWeight:700}}>Öffnen</button>
            <button onClick={()=>delPlan(plan.id)} style={{background:"#fff0f0",border:"1px solid #f5b8b8",borderRadius:9,color:"#c0392b",padding:"7px 10px",fontSize:14}}>🗑️</button>
          </div>
        </div>
      </div>
    ))}
    {/* Letzte Einheiten */}
    {Object.keys(workoutLog).length>0&&<div style={{marginTop:16}}>
      <div style={{fontSize:10,color:mu,fontWeight:700,letterSpacing:.5,marginBottom:10,textTransform:"uppercase"}}>Letzte Einheiten</div>
      {Object.entries(workoutLog).sort((a,b)=>new Date(b[0])-new Date(a[0])).slice(0,4).flatMap(([dk,sessions])=>sessions.map((s,i)=>(
        <div key={`${dk}-${i}`} style={{...card,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontSize:13,fontWeight:700,color:tx}}>{s.planName} · {s.dayName}</div>
            <div style={{fontSize:11,color:mu,marginTop:2}}>
              {dk===new Date().toDateString()?"Heute":new Date(dk).toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit"})} · {s.exercises?.length||0} Übungen
            </div>
          </div>
          <span style={{fontSize:20}}>✅</span>
        </div>
      )))}
    </div>}
  </div>;
}

// ─── PROFILE TAB ─────────────────────────────────────────────────────────────
function WeightChart({entries}){
  if(!entries||entries.length<2)return null;
  const W=320,H=120,PX=36,PY=16;
  const vals=entries.map(e=>e.weight);
  const dates=entries.map(e=>e.date);
  const minV=Math.min(...vals)-1;
  const maxV=Math.max(...vals)+1;
  const range=maxV-minV||1;
  const iW=W-PX*2,iH=H-PY*2;
  const px=(i)=>PX+i*(iW/(entries.length-1));
  const py=(v)=>PY+iH-(v-minV)/range*iH;
  const points=entries.map((e,i)=>`${px(i)},${py(e.weight)}`).join(" ");
  const areaPoints=`${PX},${PY+iH} ${points} ${px(entries.length-1)},${PY+iH}`;
  return(
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{overflow:"visible",marginTop:8}}>
      <defs>
        <linearGradient id="wGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4a7c59" stopOpacity="0.25"/>
          <stop offset="100%" stopColor="#4a7c59" stopOpacity="0"/>
        </linearGradient>
      </defs>
      {/* Grid lines */}
      {[0,0.33,0.66,1].map((t,i)=>{
        const y=PY+iH*t;
        const v=(maxV-range*t).toFixed(1);
        return <g key={i}>
          <line x1={PX} y1={y} x2={W-PX} y2={y} stroke="#d4c9a8" strokeWidth="1" strokeDasharray="3,3"/>
          <text x={PX-4} y={y+4} fontSize="8" fill="#8c7d65" textAnchor="end">{v}</text>
        </g>;
      })}
      {/* Area fill */}
      <polygon points={areaPoints} fill="url(#wGrad)"/>
      {/* Line */}
      <polyline points={points} fill="none" stroke="#4a7c59" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Dots + date labels */}
      {entries.map((e,i)=>{
        const x=px(i),y=py(e.weight);
        const label=new Date(e.date).toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit"});
        return <g key={i}>
          <circle cx={x} cy={y} r="4" fill="#4a7c59" stroke="white" strokeWidth="2"/>
          {(i===0||i===entries.length-1||entries.length<=6)&&<text x={x} y={H-2} fontSize="7.5" fill="#8c7d65" textAnchor="middle">{label}</text>}
        </g>;
      })}
    </svg>
  );
}

function ProfileTab({user,setUser,goals,bmi,stepsPerm,requestSteps,setGoals,showNotif}){
  const[editG,setEditG]=useState(goals);
  const[gOpen,setGOpen]=useState(false);
  const[weightOpen,setWeightOpen]=useState(false);
  const[newWeight,setNewWeight]=useState(String(user.weight));
  const[weightLog,setWeightLog]=useState(()=>ls("tz_weight_log",[{date:user.createdAt||new Date().toISOString(),weight:user.weight}]));

  const currentBmi=user.weight&&user.height?(user.weight/((user.height/100)**2)).toFixed(1):bmi;
  const bmiCat=currentBmi<18.5?"Untergewicht":currentBmi<25?"Normalgewicht ✓":currentBmi<30?"Übergewicht":"Adipositas";
  
  const save=()=>{setGoals(editG);lsSet(K.GOALS,editG);setGOpen(false);showNotif("🎯 Ziele gespeichert!");};
  
  const saveWeight=()=>{
    const w=parseFloat(newWeight);
    if(!w||w<20||w>300)return;
    const today=new Date().toISOString();
    // Update user weight
    const updatedUser={...user,weight:w};
    setUser(updatedUser);
    lsSet(K.USER,updatedUser);
    // Update TDEE goals
    const newGoals={...goals,calories:calcTDEE(updatedUser)||goals.calories,protein:calcProt(updatedUser)};
    setGoals(newGoals);lsSet(K.GOALS,newGoals);
    // Log weight entry
    const newLog=[...weightLog,{date:today,weight:w}];
    setWeightLog(newLog);lsSet("tz_weight_log",newLog);
    setWeightOpen(false);
    showNotif(`⚖️ Gewicht aktualisiert: ${w} kg`);
  };

  const card={background:"#faf8f2",borderRadius:18,padding:"14px 16px",border:"1px solid #d4c9a8",boxShadow:"0 2px 16px rgba(74,124,89,0.10)",marginBottom:12};
  
  return<div>
    {/* Profile header */}
    <div style={{...card,background:"linear-gradient(135deg,#e8f0e9,#faf2db)",border:"1px solid #b8a878",textAlign:"center",padding:"28px 20px"}}>
      <div style={{width:64,height:64,borderRadius:"50%",background:"linear-gradient(135deg,#4a7c59,#5c7a4e)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px",fontFamily:"'Playfair Display',serif",fontWeight:800,fontSize:26,color:"#fff",boxShadow:"0 4px 16px #4a7c5944"}}>{user.name?.[0]?.toUpperCase()}</div>
      <div style={{fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:800,color:"#2c2416"}}>{user.name}</div>
      <div style={{fontSize:12,color:"#8c7d65",marginTop:3}}>{user.gender==="male"?"Männlich":"Weiblich"} · {user.age} Jahre</div>
    </div>

    {/* Stats row */}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:10}}>
      {/* Gewicht – klickbar */}
      <button onClick={()=>{setNewWeight(String(user.weight));setWeightOpen(w=>!w);}} style={{...card,textAlign:"center",marginBottom:0,cursor:"pointer",border:weightOpen?"1.5px solid #4a7c59":"1px solid #d4c9a8",background:weightOpen?"#e8f0e9":"#faf8f2"}}>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:19,fontWeight:800,color:"#4a7c59"}}>{user.weight}<span style={{fontSize:11,fontWeight:400}}>kg</span></div>
        <div style={{fontSize:10,color:"#8c7d65",marginTop:2,fontWeight:700}}>Gewicht ✏️</div>
      </button>
      <div style={{...card,textAlign:"center",marginBottom:0}}>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:19,fontWeight:800,color:"#d4784a"}}>{user.height}<span style={{fontSize:11,fontWeight:400}}>cm</span></div>
        <div style={{fontSize:10,color:"#8c7d65",marginTop:2,fontWeight:700}}>Größe</div>
      </div>
      <div style={{...card,textAlign:"center",marginBottom:0}}>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:19,fontWeight:800,color:currentBmi<25?"#5c7a4e":"#c9a227"}}>{currentBmi}</div>
        <div style={{fontSize:10,color:"#8c7d65",marginTop:2,fontWeight:700}}>BMI</div>
      </div>
    </div>

    {/* Weight edit panel */}
    {weightOpen&&<div style={{...card,background:"#e8f0e9",border:"1.5px solid #4a7c59",marginBottom:10,animation:"slideUp .2s ease"}}>
      <div style={{fontSize:11,color:"#4a7c59",fontWeight:700,marginBottom:10,textTransform:"uppercase",letterSpacing:.5}}>⚖️ Gewicht aktualisieren</div>
      <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:12}}>
        <input
          type="number"
          inputMode="decimal"
          value={newWeight}
          onChange={e=>setNewWeight(e.target.value)}
          placeholder="z.B. 78.5"
          style={{flex:1,background:"#faf8f2",border:"1.5px solid #b8a878",borderRadius:12,padding:"12px 14px",color:"#2c2416",fontSize:18,fontWeight:700,fontFamily:"inherit"}}
          autoFocus
        />
        <span style={{fontSize:16,color:"#8c7d65",fontWeight:600}}>kg</span>
      </div>
      <div style={{display:"flex",gap:8}}>
        <button onClick={saveWeight} style={{flex:2,background:"linear-gradient(135deg,#4a7c59,#5c7a4e)",borderRadius:12,padding:"12px",color:"#fff",fontSize:14,fontWeight:700,border:"none"}}>💾 Speichern</button>
        <button onClick={()=>setWeightOpen(false)} style={{flex:1,background:"#faf8f2",borderRadius:12,padding:"12px",color:"#8c7d65",fontSize:14,fontWeight:700,border:"1px solid #d4c9a8"}}>Abbrechen</button>
      </div>
    </div>}

    {/* BMI category */}
    <div style={{fontSize:11,color:"#8c7d65",textAlign:"center",marginBottom:12}}>BMI-Kategorie: <strong style={{color:"#2c2416"}}>{bmiCat}</strong></div>

    {/* Weight chart */}
    {weightLog.length>=2&&<div style={card}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
        <div style={{fontSize:10,color:"#8c7d65",fontWeight:700,textTransform:"uppercase",letterSpacing:.5}}>📈 Gewichtsverlauf</div>
        <div style={{fontSize:11,color:"#4a7c59",fontWeight:700}}>{weightLog[weightLog.length-1].weight} kg aktuell</div>
      </div>
      <div style={{fontSize:10,color:"#8c7d65",marginBottom:4}}>
        {weightLog.length} Messungen · Start: {weightLog[0].weight} kg · {weightLog[weightLog.length-1].weight-weightLog[0].weight>0?"+":""}{(weightLog[weightLog.length-1].weight-weightLog[0].weight).toFixed(1)} kg gesamt
      </div>
      <WeightChart entries={weightLog}/>
    </div>}

    {/* Goals */}
    <div style={card}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <div style={{fontSize:10,color:"#8c7d65",fontWeight:700,textTransform:"uppercase",letterSpacing:.5}}>Tagesziele</div>
        <button onClick={()=>{setEditG(goals);setGOpen(g=>!g);}} style={{background:"#e8f0e9",border:"1px solid #4a7c5944",borderRadius:8,color:"#4a7c59",padding:"5px 12px",fontSize:11,fontWeight:700}}>Bearbeiten</button>
      </div>
      {[{l:"Kalorien",v:`${goals.calories} kcal`,c:"#4a7c59"},{l:"Protein",v:`${goals.protein}g`,c:"#c9607a"}].map(r=><div key={r.l} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid #d4c9a8"}}><span style={{fontSize:13,color:"#5c4f38"}}>{r.l}</span><span style={{fontSize:14,fontWeight:800,color:r.c}}>{r.v}</span></div>)}
      {gOpen&&<div style={{marginTop:14}}>
        {[{key:"calories",l:"Kalorien (kcal)"},{key:"protein",l:"Protein (g)"}].map(f=><div key={f.key} style={{marginBottom:12}}><div style={{fontSize:11,color:"#8c7d65",fontWeight:700,marginBottom:6,textTransform:"uppercase",letterSpacing:.4}}>{f.l}</div><input type="number" inputMode="decimal" value={editG[f.key]} onChange={e=>setEditG(g=>({...g,[f.key]:Number(e.target.value)}))} style={{width:"100%",background:"#f5f0e8",border:"1.5px solid #d4c9a8",borderRadius:12,padding:"11px 14px",color:"#2c2416",fontSize:16,fontWeight:700,fontFamily:"inherit"}}/></div>)}
        <button onClick={save} style={{width:"100%",background:"linear-gradient(135deg,#4a7c59,#5c7a4e)",borderRadius:12,padding:13,color:"#fff",fontSize:14,fontWeight:700,border:"none"}}>💾 Speichern</button>
      </div>}
    </div>

    {/* Steps */}
    <div style={card}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><div style={{fontSize:13,fontWeight:700,color:"#2c2416"}}>👟 Schrittzähler</div><div style={{fontSize:11,color:"#8c7d65",marginTop:1}}>{stepsPerm==="granted"?"✅ Aktiviert":"Nicht aktiviert"}</div></div>{stepsPerm!=="granted"&&<button onClick={requestSteps} style={{background:"#faeee6",border:"1px solid #d4784a44",borderRadius:9,color:"#d4784a",padding:"7px 14px",fontSize:12,fontWeight:700}}>Aktivieren</button>}</div>
    </div>

    {/* Account */}
    <div style={{...card,marginBottom:28}}>
      <div style={{fontSize:10,color:"#8c7d65",fontWeight:700,marginBottom:8,textTransform:"uppercase",letterSpacing:.5}}>Account</div>
      <div style={{fontSize:12,color:"#8c7d65"}}>Mitglied seit</div>
      <div style={{fontSize:14,fontWeight:700,color:"#2c2416",marginTop:3}}>{new Date(user.createdAt).toLocaleDateString("de-DE",{day:"numeric",month:"long",year:"numeric"})}</div>
    </div>
  </div>;
}
