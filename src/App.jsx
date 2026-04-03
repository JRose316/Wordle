import { useState, useEffect, useCallback } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line, CartesianGrid, Legend } from "recharts";

// ─── CONSTANTS ───────────────────────────────────────────────
const PLAYERS = ["Brandon","Geoff","Jose","Josh","Benjy","Michelle","Steph"];
const DAY_ASSIGN = { Monday:"Brandon", Tuesday:"Benjy", Wednesday:"Josh", Thursday:"Geoff", Friday:"Jose", Saturday:"Steph", Sunday:"Michelle" };
const SCORE_MAP = { 1:9, 2:7, 3:5, 4:3, 5:2, 6:1, "-":0, "X":0, "DNP":-1 };
const RATING_MAP = { 1:"Super Super Genius", 2:"Super Genius", 3:"Genius", 4:"Semi-Brave", 5:"Brave", 6:"Braver", "-":"Bravest", "X":"Bravest", "DNP":"No Show" };
const RATING_SHORT = { 1:"SSG", 2:"SG", 3:"G", 4:"SB", 5:"B", 6:"Br", "-":"X", "X":"X", "DNP":"DNP" };
const RATING_COLORS = { 1:"#FFD700", 2:"#6aaa64", 3:"#6aaa64", 4:"#b59f3b", 5:"#b59f3b", 6:"#787c7e", "-":"#3a3a3c", "X":"#3a3a3c", "DNP":"#ff4444" };
const GREEN = "#6aaa64", YELLOW = "#b59f3b", GRAY = "#3a3a3c", DARK_GRAY = "#787c7e";
const DAYS_OF_WEEK = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const Q_RANGES = {
  Q1: { start: "2026-01-01", end: "2026-03-31", label: "Q1 2026 (Jan–Mar)" },
  Q2: { start: "2026-04-01", end: "2026-06-30", label: "Q2 2026 (Apr–Jun)" },
  Q3: { start: "2026-07-01", end: "2026-09-30", label: "Q3 2026 (Jul–Sep)" },
  Q4: { start: "2026-10-01", end: "2026-12-31", label: "Q4 2026 (Oct–Dec)" },
};

const Q1_DATA = [{"date":"2026-01-01","day":"Thursday","picker":"Geoff","firstWord":"RENEW","answer":"FABLE","guesses":{"Brandon":3,"Geoff":6,"Jose":5,"Josh":4,"Benjy":5,"Michelle":6,"Steph":4},"fw":{"greens":0,"yellows":1,"grays":4,"score":1}},{"date":"2026-01-02","day":"Friday","picker":"Jose","firstWord":"MEALY","answer":"PROOF","guesses":{"Brandon":5,"Geoff":3,"Jose":5,"Josh":3,"Benjy":4,"Michelle":4,"Steph":5},"fw":{"greens":0,"yellows":0,"grays":5,"score":0}},{"date":"2026-01-03","day":"Saturday","picker":"Steph","firstWord":"POINT","answer":"SITAR","guesses":{"Brandon":4,"Geoff":3,"Jose":4,"Josh":3,"Benjy":5,"Michelle":3,"Steph":3},"fw":{"greens":0,"yellows":2,"grays":3,"score":2}},{"date":"2026-01-04","day":"Sunday","picker":"Michelle","firstWord":"TOWEL","answer":"POSSE","guesses":{"Brandon":3,"Geoff":4,"Jose":6,"Josh":5,"Benjy":5,"Michelle":4,"Steph":3},"fw":{"greens":1,"yellows":1,"grays":3,"score":3}},{"date":"2026-01-05","day":"Monday","picker":"Brandon","firstWord":"SWEAT","answer":"FILLY","guesses":{"Brandon":5,"Geoff":5,"Jose":4,"Josh":6,"Benjy":5,"Michelle":5,"Steph":4},"fw":{"greens":0,"yellows":0,"grays":5,"score":0}},{"date":"2026-01-06","day":"Tuesday","picker":"Benjy","firstWord":"SWIFT","answer":"OOMPH","guesses":{"Brandon":5,"Geoff":5,"Jose":5,"Josh":4,"Benjy":5,"Michelle":4,"Steph":5},"fw":{"greens":0,"yellows":0,"grays":5,"score":0}},{"date":"2026-01-07","day":"Wednesday","picker":"Josh","firstWord":"PASTE","answer":"PECAN","guesses":{"Brandon":4,"Geoff":3,"Jose":3,"Josh":2,"Benjy":3,"Michelle":3,"Steph":2},"fw":{"greens":1,"yellows":2,"grays":2,"score":4}},{"date":"2026-01-08","day":"Thursday","picker":"Geoff","firstWord":"SPORE","answer":"BLAST","guesses":{"Brandon":3,"Geoff":5,"Jose":4,"Josh":3,"Benjy":3,"Michelle":4,"Steph":3},"fw":{"greens":0,"yellows":1,"grays":4,"score":1}},{"date":"2026-01-09","day":"Friday","picker":"Jose","firstWord":"BICEP","answer":"EIGHT","guesses":{"Brandon":3,"Geoff":3,"Jose":4,"Josh":3,"Benjy":3,"Michelle":3,"Steph":2},"fw":{"greens":1,"yellows":1,"grays":3,"score":3}},{"date":"2026-01-10","day":"Saturday","picker":"Steph","firstWord":"SKATE","answer":"MANIC","guesses":{"Brandon":6,"Geoff":4,"Jose":3,"Josh":6,"Benjy":5,"Michelle":5,"Steph":4},"fw":{"greens":0,"yellows":1,"grays":4,"score":1}},{"date":"2026-01-11","day":"Sunday","picker":"Michelle","firstWord":"BOARD","answer":"QUARK","guesses":{"Brandon":5,"Geoff":3,"Jose":5,"Josh":2,"Benjy":5,"Michelle":5,"Steph":5},"fw":{"greens":2,"yellows":0,"grays":3,"score":4}},{"date":"2026-01-12","day":"Monday","picker":"Brandon","firstWord":"TRAIL","answer":"TRIAL","guesses":{"Brandon":2,"Geoff":2,"Jose":2,"Josh":2,"Benjy":2,"Michelle":2,"Steph":2},"fw":{"greens":3,"yellows":2,"grays":0,"score":8}},{"date":"2026-01-13","day":"Tuesday","picker":"Benjy","firstWord":"AMEND","answer":"GUMBO","guesses":{"Brandon":5,"Geoff":4,"Jose":5,"Josh":4,"Benjy":5,"Michelle":5,"Steph":4},"fw":{"greens":0,"yellows":1,"grays":4,"score":1}},{"date":"2026-01-14","day":"Wednesday","picker":"Josh","firstWord":"CRUEL","answer":"AVOID","guesses":{"Brandon":"-","Geoff":4,"Jose":4,"Josh":3,"Benjy":4,"Michelle":4,"Steph":4},"fw":{"greens":0,"yellows":0,"grays":5,"score":0}},{"date":"2026-01-15","day":"Thursday","picker":"Geoff","firstWord":"BUNCH","answer":"CHASM","guesses":{"Brandon":4,"Geoff":5,"Jose":6,"Josh":6,"Benjy":5,"Michelle":5,"Steph":4},"fw":{"greens":0,"yellows":2,"grays":3,"score":2}},{"date":"2026-01-16","day":"Friday","picker":"Jose","firstWord":"DREAM","answer":"RACER","guesses":{"Brandon":4,"Geoff":5,"Jose":"-","Josh":3,"Benjy":4,"Michelle":4,"Steph":4},"fw":{"greens":0,"yellows":3,"grays":2,"score":3}},{"date":"2026-01-17","day":"Saturday","picker":"Steph","firstWord":"CABIN","answer":"FIERY","guesses":{"Brandon":4,"Geoff":6,"Jose":5,"Josh":5,"Benjy":3,"Michelle":4,"Steph":3},"fw":{"greens":0,"yellows":1,"grays":4,"score":1}},{"date":"2026-01-18","day":"Sunday","picker":"Michelle","firstWord":"HOUSE","answer":"SUMAC","guesses":{"Brandon":4,"Geoff":5,"Jose":4,"Josh":5,"Benjy":5,"Michelle":3,"Steph":3},"fw":{"greens":0,"yellows":2,"grays":3,"score":2}},{"date":"2026-01-19","day":"Monday","picker":"Brandon","firstWord":"IMPLY","answer":"VODKA","guesses":{"Brandon":6,"Geoff":5,"Jose":5,"Josh":5,"Benjy":5,"Michelle":4,"Steph":4},"fw":{"greens":0,"yellows":0,"grays":5,"score":0}},{"date":"2026-01-20","day":"Tuesday","picker":"Benjy","firstWord":"GROUT","answer":"PLUME","guesses":{"Brandon":4,"Geoff":5,"Jose":3,"Josh":4,"Benjy":5,"Michelle":4,"Steph":3},"fw":{"greens":0,"yellows":1,"grays":4,"score":1}},{"date":"2026-01-21","day":"Wednesday","picker":"Josh","firstWord":"CHILD","answer":"TYING","guesses":{"Brandon":4,"Geoff":4,"Jose":3,"Josh":3,"Benjy":3,"Michelle":4,"Steph":2},"fw":{"greens":0,"yellows":0,"grays":5,"score":0}},{"date":"2026-01-22","day":"Thursday","picker":"Geoff","firstWord":"GLOBE","answer":"LINER","guesses":{"Brandon":5,"Geoff":4,"Jose":5,"Josh":5,"Benjy":5,"Michelle":3,"Steph":4},"fw":{"greens":0,"yellows":1,"grays":4,"score":1}},{"date":"2026-01-23","day":"Friday","picker":"Jose","firstWord":"NIGHT","answer":"DEBAR","guesses":{"Brandon":4,"Geoff":5,"Jose":4,"Josh":4,"Benjy":5,"Michelle":4,"Steph":4},"fw":{"greens":0,"yellows":0,"grays":5,"score":0}},{"date":"2026-01-24","day":"Saturday","picker":"Steph","firstWord":"LUNAR","answer":"GUISE","guesses":{"Brandon":5,"Geoff":3,"Jose":3,"Josh":4,"Benjy":4,"Michelle":5,"Steph":4},"fw":{"greens":0,"yellows":1,"grays":4,"score":1}},{"date":"2026-01-25","day":"Sunday","picker":"Michelle","firstWord":"CATER","answer":"SHINY","guesses":{"Brandon":4,"Geoff":3,"Jose":3,"Josh":4,"Benjy":4,"Michelle":4,"Steph":5},"fw":{"greens":0,"yellows":0,"grays":5,"score":0}},{"date":"2026-01-26","day":"Monday","picker":"Brandon","firstWord":"SWUNG","answer":"KNOLL","guesses":{"Brandon":5,"Geoff":5,"Jose":5,"Josh":5,"Benjy":6,"Michelle":3,"Steph":4},"fw":{"greens":0,"yellows":1,"grays":4,"score":1}},{"date":"2026-01-27","day":"Tuesday","picker":"Benjy","firstWord":"PRONG","answer":"SPURT","guesses":{"Brandon":4,"Geoff":4,"Jose":4,"Josh":3,"Benjy":3,"Michelle":4,"Steph":6},"fw":{"greens":0,"yellows":1,"grays":4,"score":1}},{"date":"2026-01-28","day":"Wednesday","picker":"Josh","firstWord":"TIDAL","answer":"LYRIC","guesses":{"Brandon":6,"Geoff":4,"Jose":4,"Josh":4,"Benjy":5,"Michelle":5,"Steph":4},"fw":{"greens":0,"yellows":1,"grays":4,"score":1}},{"date":"2026-01-29","day":"Thursday","picker":"Geoff","firstWord":"MAJOR","answer":"OXIDE","guesses":{"Brandon":4,"Geoff":4,"Jose":3,"Josh":5,"Benjy":5,"Michelle":5,"Steph":4},"fw":{"greens":0,"yellows":1,"grays":4,"score":1}},{"date":"2026-01-30","day":"Friday","picker":"Jose","firstWord":"BELOW","answer":"BOTCH","guesses":{"Brandon":3,"Geoff":3,"Jose":3,"Josh":2,"Benjy":3,"Michelle":3,"Steph":2},"fw":{"greens":1,"yellows":1,"grays":3,"score":3}},{"date":"2026-01-31","day":"Saturday","picker":"Steph","firstWord":"AGILE","answer":"SPICE","guesses":{"Brandon":4,"Geoff":4,"Jose":3,"Josh":4,"Benjy":4,"Michelle":5,"Steph":3},"fw":{"greens":0,"yellows":1,"grays":4,"score":1}},{"date":"2026-02-01","day":"Sunday","picker":"Michelle","firstWord":"PAINT","answer":"PATCH","guesses":{"Brandon":3,"Geoff":2,"Jose":3,"Josh":3,"Benjy":3,"Michelle":3,"Steph":2},"fw":{"greens":1,"yellows":2,"grays":2,"score":4}},{"date":"2026-02-02","day":"Monday","picker":"Brandon","firstWord":"CLEAN","answer":"SWIRL","guesses":{"Brandon":5,"Geoff":5,"Jose":5,"Josh":5,"Benjy":5,"Michelle":4,"Steph":5},"fw":{"greens":0,"yellows":1,"grays":4,"score":1}},{"date":"2026-02-03","day":"Tuesday","picker":"Benjy","firstWord":"BLANK","answer":"DOWDY","guesses":{"Brandon":5,"Geoff":5,"Jose":4,"Josh":5,"Benjy":4,"Michelle":4,"Steph":4},"fw":{"greens":0,"yellows":0,"grays":5,"score":0}},{"date":"2026-02-04","day":"Wednesday","picker":"Josh","firstWord":"RIVET","answer":"CREEP","guesses":{"Brandon":4,"Geoff":4,"Jose":5,"Josh":4,"Benjy":4,"Michelle":3,"Steph":5},"fw":{"greens":0,"yellows":2,"grays":3,"score":2}},{"date":"2026-02-05","day":"Thursday","picker":"Geoff","firstWord":"FROST","answer":"BLISS","guesses":{"Brandon":5,"Geoff":3,"Jose":4,"Josh":5,"Benjy":5,"Michelle":6,"Steph":3},"fw":{"greens":0,"yellows":1,"grays":4,"score":1}},{"date":"2026-02-06","day":"Friday","picker":"Jose","firstWord":"INEPT","answer":"LUSTY","guesses":{"Brandon":5,"Geoff":5,"Jose":5,"Josh":6,"Benjy":6,"Michelle":5,"Steph":3},"fw":{"greens":0,"yellows":1,"grays":4,"score":1}},{"date":"2026-02-07","day":"Saturday","picker":"Steph","firstWord":"PLUMB","answer":"ULTRA","guesses":{"Brandon":5,"Geoff":4,"Jose":4,"Josh":4,"Benjy":4,"Michelle":5,"Steph":3},"fw":{"greens":0,"yellows":2,"grays":3,"score":2}},{"date":"2026-02-08","day":"Sunday","picker":"Michelle","firstWord":"FLOAT","answer":"THORN","guesses":{"Brandon":5,"Geoff":4,"Jose":3,"Josh":4,"Benjy":4,"Michelle":4,"Steph":4},"fw":{"greens":0,"yellows":2,"grays":3,"score":2}},{"date":"2026-02-09","day":"Monday","picker":"Brandon","firstWord":"OCEAN","answer":"MAXIM","guesses":{"Brandon":5,"Geoff":5,"Jose":4,"Josh":5,"Benjy":5,"Michelle":5,"Steph":4},"fw":{"greens":0,"yellows":0,"grays":5,"score":0}},{"date":"2026-02-10","day":"Tuesday","picker":"Benjy","firstWord":"STEAD","answer":"DEITY","guesses":{"Brandon":3,"Geoff":4,"Jose":3,"Josh":3,"Benjy":3,"Michelle":3,"Steph":3},"fw":{"greens":0,"yellows":2,"grays":3,"score":2}},{"date":"2026-02-11","day":"Wednesday","picker":"Josh","firstWord":"GRASP","answer":"PLAID","guesses":{"Brandon":4,"Geoff":4,"Jose":5,"Josh":3,"Benjy":3,"Michelle":4,"Steph":4},"fw":{"greens":0,"yellows":1,"grays":4,"score":1}},{"date":"2026-02-12","day":"Thursday","picker":"Geoff","firstWord":"YACHT","answer":"UNFIT","guesses":{"Brandon":5,"Geoff":4,"Jose":3,"Josh":4,"Benjy":4,"Michelle":5,"Steph":4},"fw":{"greens":0,"yellows":1,"grays":4,"score":1}},{"date":"2026-02-13","day":"Friday","picker":"Jose","firstWord":"LEMON","answer":"PERCH","guesses":{"Brandon":5,"Geoff":5,"Jose":4,"Josh":4,"Benjy":3,"Michelle":5,"Steph":4},"fw":{"greens":0,"yellows":1,"grays":4,"score":1}},{"date":"2026-02-14","day":"Saturday","picker":"Steph","firstWord":"HEART","answer":"ERUPT","guesses":{"Brandon":4,"Geoff":4,"Jose":3,"Josh":2,"Benjy":4,"Michelle":4,"Steph":4},"fw":{"greens":1,"yellows":2,"grays":2,"score":4}},{"date":"2026-02-15","day":"Sunday","picker":"Michelle","firstWord":"MOUNT","answer":"THIGH","guesses":{"Brandon":3,"Geoff":3,"Jose":4,"Josh":3,"Benjy":3,"Michelle":3,"Steph":3},"fw":{"greens":0,"yellows":1,"grays":4,"score":1}},{"date":"2026-02-16","day":"Monday","picker":"Brandon","firstWord":"STRIP","answer":"SPECK","guesses":{"Brandon":4,"Geoff":5,"Jose":5,"Josh":5,"Benjy":4,"Michelle":4,"Steph":4},"fw":{"greens":1,"yellows":1,"grays":3,"score":3}},{"date":"2026-02-17","day":"Tuesday","picker":"Benjy","firstWord":"CRANE","answer":"DISCO","guesses":{"Brandon":4,"Geoff":5,"Jose":4,"Josh":5,"Benjy":4,"Michelle":4,"Steph":4},"fw":{"greens":0,"yellows":1,"grays":4,"score":1}},{"date":"2026-02-18","day":"Wednesday","picker":"Josh","firstWord":"BUTCH","answer":"TANGY","guesses":{"Brandon":5,"Geoff":4,"Jose":3,"Josh":3,"Benjy":3,"Michelle":4,"Steph":"-"},"fw":{"greens":0,"yellows":1,"grays":4,"score":1}},{"date":"2026-02-19","day":"Thursday","picker":"Geoff","firstWord":"QUIRK","answer":"HYENA","guesses":{"Brandon":5,"Geoff":"-","Jose":4,"Josh":5,"Benjy":3,"Michelle":3,"Steph":4},"fw":{"greens":0,"yellows":0,"grays":5,"score":0}},{"date":"2026-02-20","day":"Friday","picker":"Jose","firstWord":"TWINE","answer":"STOIC","guesses":{"Brandon":4,"Geoff":4,"Jose":3,"Josh":4,"Benjy":4,"Michelle":5,"Steph":4},"fw":{"greens":0,"yellows":1,"grays":4,"score":1}},{"date":"2026-02-21","day":"Saturday","picker":"Steph","firstWord":"DRIVE","answer":"LIVID","guesses":{"Brandon":5,"Geoff":6,"Jose":5,"Josh":4,"Benjy":5,"Michelle":4,"Steph":4},"fw":{"greens":0,"yellows":2,"grays":3,"score":2}},{"date":"2026-02-22","day":"Sunday","picker":"Michelle","firstWord":"STERN","answer":"FRISK","guesses":{"Brandon":4,"Geoff":4,"Jose":4,"Josh":4,"Benjy":5,"Michelle":4,"Steph":3},"fw":{"greens":0,"yellows":1,"grays":4,"score":1}},{"date":"2026-02-23","day":"Monday","picker":"Brandon","firstWord":"FILET","answer":"ELFIN","guesses":{"Brandon":3,"Geoff":3,"Jose":3,"Josh":3,"Benjy":3,"Michelle":3,"Steph":3},"fw":{"greens":0,"yellows":3,"grays":2,"score":3}},{"date":"2026-02-24","day":"Tuesday","picker":"Benjy","firstWord":"VENOM","answer":"OUTDO","guesses":{"Brandon":4,"Geoff":4,"Jose":4,"Josh":5,"Benjy":4,"Michelle":3,"Steph":4},"fw":{"greens":0,"yellows":1,"grays":4,"score":1}},{"date":"2026-02-25","day":"Wednesday","picker":"Josh","firstWord":"FORGE","answer":"TONAL","guesses":{"Brandon":5,"Geoff":5,"Jose":4,"Josh":4,"Benjy":4,"Michelle":5,"Steph":5},"fw":{"greens":0,"yellows":1,"grays":4,"score":1}},{"date":"2026-02-26","day":"Thursday","picker":"Geoff","firstWord":"SLIME","answer":"GRIEF","guesses":{"Brandon":4,"Geoff":5,"Jose":4,"Josh":4,"Benjy":4,"Michelle":3,"Steph":4},"fw":{"greens":0,"yellows":2,"grays":3,"score":2}},{"date":"2026-02-27","day":"Friday","picker":"Jose","firstWord":"TENOR","answer":"OPTIC","guesses":{"Brandon":5,"Geoff":5,"Jose":5,"Josh":5,"Benjy":5,"Michelle":5,"Steph":4},"fw":{"greens":0,"yellows":2,"grays":3,"score":2}},{"date":"2026-02-28","day":"Saturday","picker":"Steph","firstWord":"PRIME","answer":"BRINE","guesses":{"Brandon":4,"Geoff":3,"Jose":3,"Josh":3,"Benjy":4,"Michelle":4,"Steph":3},"fw":{"greens":0,"yellows":3,"grays":2,"score":3}},{"date":"2026-03-01","day":"Sunday","picker":"Michelle","firstWord":"ANKLE","answer":"ICING","guesses":{"Brandon":2,"Geoff":2,"Jose":2,"Josh":2,"Benjy":3,"Michelle":2,"Steph":2},"fw":{"greens":0,"yellows":1,"grays":4,"score":1}},{"date":"2026-03-02","day":"Monday","picker":"Brandon","firstWord":"SLICE","answer":"LEDGE","guesses":{"Brandon":3,"Geoff":3,"Jose":3,"Josh":3,"Benjy":3,"Michelle":3,"Steph":2},"fw":{"greens":0,"yellows":2,"grays":3,"score":2}},{"date":"2026-03-03","day":"Tuesday","picker":"Benjy","firstWord":"DARTS","answer":"MOTEL","guesses":{"Brandon":5,"Geoff":5,"Jose":4,"Josh":4,"Benjy":4,"Michelle":3,"Steph":3},"fw":{"greens":0,"yellows":1,"grays":4,"score":1}},{"date":"2026-03-04","day":"Wednesday","picker":"Josh","firstWord":"BRAID","answer":"VINYL","guesses":{"Brandon":5,"Geoff":4,"Jose":5,"Josh":4,"Benjy":5,"Michelle":5,"Steph":4},"fw":{"greens":0,"yellows":1,"grays":4,"score":1}},{"date":"2026-03-05","day":"Thursday","picker":"Geoff","firstWord":"POKER","answer":"WOKEN","guesses":{"Brandon":5,"Geoff":4,"Jose":3,"Josh":5,"Benjy":4,"Michelle":3,"Steph":4},"fw":{"greens":0,"yellows":2,"grays":3,"score":2}},{"date":"2026-03-06","day":"Friday","picker":"Jose","firstWord":"GENIE","answer":"WINDY","guesses":{"Brandon":5,"Geoff":4,"Jose":3,"Josh":5,"Benjy":4,"Michelle":4,"Steph":4},"fw":{"greens":0,"yellows":1,"grays":4,"score":1}},{"date":"2026-03-07","day":"Saturday","picker":"Steph","firstWord":"TIGER","answer":"FETCH","guesses":{"Brandon":4,"Geoff":4,"Jose":4,"Josh":4,"Benjy":5,"Michelle":5,"Steph":4},"fw":{"greens":0,"yellows":1,"grays":4,"score":1}},{"date":"2026-03-08","day":"Sunday","picker":"Michelle","firstWord":"SCOPE","answer":"ESSAY","guesses":{"Brandon":6,"Geoff":4,"Jose":3,"Josh":4,"Benjy":5,"Michelle":4,"Steph":4},"fw":{"greens":0,"yellows":1,"grays":4,"score":1}},{"date":"2026-03-09","day":"Monday","picker":"Brandon","firstWord":"FLAME","answer":"ELFIN","guesses":{"Brandon":4,"Geoff":3,"Jose":5,"Josh":4,"Benjy":4,"Michelle":3,"Steph":4},"fw":{"greens":0,"yellows":2,"grays":3,"score":2}},{"date":"2026-03-10","day":"Tuesday","picker":"Benjy","firstWord":"ADORN","answer":"NOTED","guesses":{"Brandon":3,"Geoff":3,"Jose":3,"Josh":3,"Benjy":2,"Michelle":3,"Steph":2},"fw":{"greens":0,"yellows":2,"grays":3,"score":2}},{"date":"2026-03-11","day":"Wednesday","picker":"Josh","firstWord":"FLUTE","answer":"COCOA","guesses":{"Brandon":4,"Geoff":5,"Jose":4,"Josh":4,"Benjy":4,"Michelle":5,"Steph":5},"fw":{"greens":0,"yellows":0,"grays":5,"score":0}},{"date":"2026-03-12","day":"Thursday","picker":"Jose","firstWord":"BRICK","answer":"PYGMY","guesses":{"Brandon":6,"Geoff":5,"Jose":5,"Josh":6,"Benjy":5,"Michelle":4,"Steph":4},"fw":{"greens":0,"yellows":0,"grays":5,"score":0}},{"date":"2026-03-13","day":"Friday","picker":"Jose","firstWord":"FLIRT","answer":"BOSSY","guesses":{"Brandon":5,"Geoff":6,"Jose":5,"Josh":5,"Benjy":5,"Michelle":5,"Steph":5},"fw":{"greens":0,"yellows":0,"grays":5,"score":0}},{"date":"2026-03-14","day":"Saturday","picker":"Steph","firstWord":"PLAID","answer":"EXULT","guesses":{"Brandon":4,"Geoff":4,"Jose":4,"Josh":5,"Benjy":5,"Michelle":4,"Steph":4},"fw":{"greens":0,"yellows":1,"grays":4,"score":1}},{"date":"2026-03-15","day":"Sunday","picker":"Michelle","firstWord":"HONEY","answer":"TACIT","guesses":{"Brandon":5,"Geoff":4,"Jose":5,"Josh":3,"Benjy":4,"Michelle":3,"Steph":4},"fw":{"greens":0,"yellows":0,"grays":5,"score":0}},{"date":"2026-03-16","day":"Monday","picker":"Brandon","firstWord":"CLASP","answer":"VYING","guesses":{"Brandon":5,"Geoff":5,"Jose":4,"Josh":6,"Benjy":5,"Michelle":5,"Steph":3},"fw":{"greens":0,"yellows":0,"grays":5,"score":0}},{"date":"2026-03-17","day":"Tuesday","picker":"Benjy","firstWord":"PLEAT","answer":"PLEAT","guesses":{"Brandon":3,"Geoff":2,"Jose":2,"Josh":2,"Benjy":2,"Michelle":3,"Steph":3},"fw":{"greens":2,"yellows":1,"grays":2,"score":5}},{"date":"2026-03-18","day":"Wednesday","picker":"Josh","firstWord":"BLEND","answer":"BUDDY","guesses":{"Brandon":5,"Geoff":3,"Jose":5,"Josh":4,"Benjy":4,"Michelle":3,"Steph":3},"fw":{"greens":1,"yellows":0,"grays":4,"score":2}},{"date":"2026-03-19","day":"Thursday","picker":"Geoff","firstWord":"ONSET","answer":"REBAR","guesses":{"Brandon":4,"Geoff":4,"Jose":5,"Josh":5,"Benjy":3,"Michelle":5,"Steph":4},"fw":{"greens":0,"yellows":1,"grays":4,"score":1}},{"date":"2026-03-20","day":"Friday","picker":"Jose","firstWord":"YOUTH","answer":"CAULK","guesses":{"Brandon":4,"Geoff":5,"Jose":3,"Josh":5,"Benjy":4,"Michelle":5,"Steph":4},"fw":{"greens":0,"yellows":1,"grays":4,"score":1}},{"date":"2026-03-21","day":"Saturday","picker":"Steph","firstWord":"MARCH","answer":"ALIGN","guesses":{"Brandon":3,"Geoff":3,"Jose":3,"Josh":3,"Benjy":2,"Michelle":3,"Steph":3},"fw":{"greens":0,"yellows":1,"grays":4,"score":1}},{"date":"2026-03-22","day":"Sunday","picker":"Michelle","firstWord":"RIVAL","answer":"REGAL","guesses":{"Brandon":3,"Geoff":2,"Jose":"-","Josh":2,"Benjy":3,"Michelle":3,"Steph":2},"fw":{"greens":1,"yellows":2,"grays":2,"score":4}},{"date":"2026-03-23","day":"Monday","picker":"Brandon","firstWord":"CHAMP","answer":"SERIF","guesses":{"Brandon":4,"Geoff":5,"Jose":4,"Josh":3,"Benjy":3,"Michelle":5,"Steph":4},"fw":{"greens":0,"yellows":0,"grays":5,"score":0}},{"date":"2026-03-24","day":"Tuesday","picker":"Benjy","firstWord":"PRICE","answer":"BROOD","guesses":{"Brandon":3,"Geoff":4,"Jose":3,"Josh":3,"Benjy":4,"Michelle":3,"Steph":4},"fw":{"greens":0,"yellows":1,"grays":4,"score":1}},{"date":"2026-03-25","day":"Wednesday","picker":"Josh","firstWord":"BRISK","answer":"WISER","guesses":{"Brandon":4,"Geoff":5,"Jose":5,"Josh":4,"Benjy":6,"Michelle":4,"Steph":2},"fw":{"greens":0,"yellows":1,"grays":4,"score":1}},{"date":"2026-03-26","day":"Thursday","picker":"Geoff","firstWord":"LAGER","answer":"BEFIT","guesses":{"Brandon":4,"Geoff":6,"Jose":4,"Josh":4,"Benjy":4,"Michelle":5,"Steph":4},"fw":{"greens":0,"yellows":1,"grays":4,"score":1}},{"date":"2026-03-27","day":"Friday","picker":"Jose","firstWord":"DEBIT","answer":"IVORY","guesses":{"Brandon":4,"Geoff":4,"Jose":4,"Josh":4,"Benjy":4,"Michelle":3,"Steph":3},"fw":{"greens":0,"yellows":1,"grays":4,"score":1}},{"date":"2026-03-28","day":"Saturday","picker":"Steph","firstWord":"SKIER","answer":"AFOOT","guesses":{"Brandon":5,"Geoff":4,"Jose":"-","Josh":4,"Benjy":4,"Michelle":5,"Steph":3},"fw":{"greens":0,"yellows":0,"grays":5,"score":0}},{"date":"2026-03-29","day":"Sunday","picker":"Michelle","firstWord":"ALIVE","answer":"CHUMP","guesses":{"Brandon":4,"Geoff":6,"Jose":5,"Josh":4,"Benjy":4,"Michelle":4,"Steph":4},"fw":{"greens":0,"yellows":0,"grays":5,"score":0}},{"date":"2026-03-30","day":"Monday","picker":"Brandon","firstWord":"UPEND","answer":"COMET","guesses":{"Brandon":4,"Geoff":3,"Jose":3,"Josh":3,"Benjy":4,"Michelle":4,"Steph":5},"fw":{"greens":0,"yellows":1,"grays":4,"score":1}},{"date":"2026-03-31","day":"Tuesday","picker":"Benjy","firstWord":"SLURP","answer":"SWAMP","guesses":{"Brandon":3,"Geoff":null,"Jose":null,"Josh":3,"Benjy":2,"Michelle":3,"Steph":null},"fw":{"greens":2,"yellows":0,"grays":3,"score":4}}];

// ─── HELPERS ─────────────────────────────────────────────────
const toScore = g => SCORE_MAP[g] ?? 0;
const toRating = g => RATING_MAP[g] ?? "—";
const fmtDate = d => { const dt = new Date(d+"T12:00:00"); return dt.toLocaleDateString("en-US",{month:"short",day:"numeric"}); };
const fmtDateFull = d => { const dt = new Date(d+"T12:00:00"); return dt.toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"}); };
const getDayOfWeek = d => new Date(d+"T12:00:00").toLocaleDateString("en-US",{weekday:"long"});

function getQuarterForDate(d) {
  const m = parseInt(d.split("-")[1]);
  if (m <= 3) return "Q1"; if (m <= 6) return "Q2"; if (m <= 9) return "Q3"; return "Q4";
}

// ─── GOOGLE SHEETS DATA SOURCE ──────────────────────────────
const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQXxb8AJj2b9HzJPVd6njrCRlA411Xan7P59wxrdmlHeR2cGv0Q8kwpZOLp3meBxQJ7Qz7_tH9yFLvu/pub?gid=824587220&single=true&output=csv";
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwBFHa2Bh6A22nOkZ5BBZXne4koRrDzUX8E7meObv5vGk9ZutuIbPvAKhJ0WP-0VVwpEw/exec";

function parseCSV(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l);
  if (lines.length < 2) return {};
  const result = { Q1:[], Q2:[], Q3:[], Q4:[] };
  
  function parseDate(raw) {
    if (!raw) return null;
    raw = raw.replace(/^"|"$/g, '').trim();
    // Already YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
    // Google Sheets serial number (just digits, typically 40000-50000 range for 2010s-2030s)
    if (/^\d{4,5}$/.test(raw)) {
      const serial = parseInt(raw);
      const d = new Date(1899, 11, 30 + serial);
      return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    }
    // M/D/YYYY or MM/DD/YYYY
    const slashMatch = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (slashMatch) {
      return `${slashMatch[3]}-${slashMatch[1].padStart(2,'0')}-${slashMatch[2].padStart(2,'0')}`;
    }
    // M/D/YY or MM/DD/YY (2-digit year, assume 2000s)
    const shortYearMatch = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2})$/);
    if (shortYearMatch) {
      const yr = 2000 + parseInt(shortYearMatch[3]);
      return `${yr}-${shortYearMatch[1].padStart(2,'0')}-${shortYearMatch[2].padStart(2,'0')}`;
    }
    // "Mon D" or "Mon DD" (no year — assume 2026 since this is a 2026 sheet)
    const monthDay = raw.match(/^([A-Za-z]{3,9})\s+(\d{1,2})$/);
    if (monthDay) {
      const months = {jan:1,feb:2,mar:3,apr:4,may:5,jun:6,jul:7,aug:8,sep:9,oct:10,nov:11,dec:12};
      const m = months[monthDay[1].toLowerCase().slice(0,3)];
      if (m) return `2026-${String(m).padStart(2,'0')}-${monthDay[2].padStart(2,'0')}`;
    }
    // Fallback: try native Date parsing but force year to 2026 if it comes back wrong
    try {
      const d = new Date(raw);
      if (!isNaN(d)) {
        const yr = d.getFullYear();
        const finalYr = (yr < 2025 || yr > 2030) ? 2026 : yr;
        return `${finalYr}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      }
    } catch {}
    return null;
  }
  
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
    if (cols.length < 17) continue;
    
    const dateStr = parseDate(cols[0]);
    if (!dateStr) continue;
    
    const quarter = cols[1] || getQuarterForDate(dateStr);
    const day = cols[2];
    const picker = cols[3];
    const firstWord = cols[4] || "";
    const answer = cols[5] || "";
    const greens = parseInt(cols[6]) || 0;
    const yellows = parseInt(cols[7]) || 0;
    const grays = parseInt(cols[8]) || 0;
    
    // Parse player guesses
    const guesses = {};
    let hasAnyData = false;
    PLAYERS.forEach((p, j) => {
      const val = cols[10 + j];
      if (!val || val === "") { guesses[p] = null; }
      else if (val === "X" || val === "-") { guesses[p] = "-"; hasAnyData = true; }
      else if (val === "DNP") { guesses[p] = "DNP"; hasAnyData = true; }
      else { const n = parseInt(val); guesses[p] = isNaN(n) ? null : n; if (!isNaN(n)) hasAnyData = true; }
    });
    
    // Only include rows that have some data entered
    if (!hasAnyData && !firstWord && !answer) continue;
    
    const entry = {
      date: dateStr, day, picker, firstWord: firstWord.toUpperCase(), answer: answer.toUpperCase(),
      guesses,
      fw: { greens, yellows, grays, score: greens * 2 + yellows }
    };
    
    if (result[quarter]) result[quarter].push(entry);
  }
  
  return result;
}

async function fetchSheetData() {
  try {
    const res = await fetch(SHEET_CSV_URL);
    if (!res.ok) throw new Error("Fetch failed");
    const text = await res.text();
    return parseCSV(text);
  } catch (e) {
    console.error("Failed to fetch sheet data:", e);
    return null;
  }
}

// ─── STYLES ──────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Libre+Franklin:wght@400;500;600;700;800;900&family=DM+Mono:wght@400;500&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
:root{--bg:#121213;--surface:#1a1a1b;--card:#262626;--card2:#1e1e1f;--border:#3a3a3c;--text:#d7dadc;--text2:#818384;--green:#6aaa64;--yellow:#b59f3b;--gray:#3a3a3c;--dgray:#787c7e;--gold:#FFD700;--white:#fff;}
body{background:var(--bg);color:var(--text);font-family:'Libre Franklin',sans-serif;}
::-webkit-scrollbar{width:4px;}::-webkit-scrollbar-track{background:var(--bg);}::-webkit-scrollbar-thumb{background:var(--green);border-radius:2px;}
@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
.refreshing{animation:spin .8s linear infinite;}
input,select,textarea{font-family:'Libre Franklin',sans-serif;}
`;

const s = {
  app: { minHeight:"100vh",background:"var(--bg)",padding:"0 0 40px" },
  header: { background:"var(--bg)",borderBottom:"1px solid var(--border)",padding:"16px 16px 14px",textAlign:"center",position:"sticky",top:0,zIndex:100 },
  title: { display:"inline-flex",alignItems:"center",gap:1,fontSize:32,fontWeight:800,letterSpacing:1,color:"var(--white)",fontFamily:"'Libre Franklin',sans-serif",textTransform:"uppercase" },
  titleTile: (bg) => ({ width:36,height:36,display:"inline-flex",alignItems:"center",justifyContent:"center",borderRadius:4,background:bg||"transparent",color:bg?"var(--white)":"var(--white)",fontSize:28,fontWeight:800,lineHeight:1 }),
  qTabs: { display:"flex",gap:2,padding:"12px 16px 0",background:"var(--bg)" },
  qTab: (a) => ({ flex:1,padding:"10px 0",textAlign:"center",fontSize:12,fontWeight:700,letterSpacing:1,cursor:"pointer",border:"none",borderRadius:"8px 8px 0 0",background:a?"var(--card)":"transparent",color:a?"var(--green)":"var(--text2)",borderBottom:a?"2px solid var(--green)":"2px solid transparent",transition:"all .2s" }),
  nav: { display:"flex",gap:6,padding:"12px 16px",overflowX:"auto" },
  navBtn: (a) => ({ padding:"8px 16px",fontSize:11,fontWeight:700,letterSpacing:1,border:"none",borderRadius:20,cursor:"pointer",background:a?"var(--green)":"var(--card)",color:a?"#000":"var(--text2)",transition:"all .2s",whiteSpace:"nowrap",textTransform:"uppercase" }),
  content: { padding:"0 16px",maxWidth:900,margin:"0 auto" },
  card: { background:"var(--card)",borderRadius:12,padding:16,marginBottom:12 },
  cardTitle: { fontFamily:"'DM Mono',monospace",fontSize:11,fontWeight:500,letterSpacing:2,color:"var(--green)",textTransform:"uppercase",marginBottom:12 },
  row: { display:"flex",alignItems:"center",padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,.04)" },
  rank: (i) => ({ width:28,height:28,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:13,marginRight:10,background:i===0?"var(--gold)":i===1?"#C0C0C0":i===2?"#CD7F32":"var(--gray)",color:i<3?"#000":"var(--text)" }),
  name: { flex:1,fontWeight:600,fontSize:14 },
  stat: { fontFamily:"'DM Mono',monospace",fontSize:13,color:"var(--text2)",marginLeft:12,textAlign:"right",minWidth:40 },
  statHi: { fontFamily:"'DM Mono',monospace",fontSize:16,fontWeight:700,color:"var(--white)",marginLeft:12,textAlign:"right",minWidth:40 },
  pill: (bg,c) => ({ display:"inline-block",padding:"2px 8px",borderRadius:10,fontSize:10,fontWeight:700,background:bg||"var(--gray)",color:c||"var(--white)",letterSpacing:.5 }),
  input: { width:"100%",padding:"10px 12px",background:"var(--surface)",border:"1.5px solid var(--border)",borderRadius:8,color:"var(--text)",fontSize:13,outline:"none" },
  btn: { padding:"12px 24px",background:"var(--green)",border:"none",borderRadius:8,color:"#000",fontSize:13,fontWeight:800,cursor:"pointer",letterSpacing:1,textTransform:"uppercase" },
  btnSm: { padding:"6px 14px",background:"var(--green)",border:"none",borderRadius:6,color:"#000",fontSize:11,fontWeight:700,cursor:"pointer" },
  grid: { display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))",gap:8 },
  miniCard: (bg) => ({ background:bg||"var(--card2)",borderRadius:8,padding:12,textAlign:"center" }),
  distBar: (pct,color) => ({ height:6,borderRadius:3,background:"rgba(255,255,255,.06)",overflow:"hidden",marginTop:4,position:"relative" }),
};

// ─── COMPUTE STATS ───────────────────────────────────────────
function computeStats(entries, quarter) {
  const stats = {};
  PLAYERS.forEach(p => { stats[p] = { points:0, games:0, totalGuesses:0, dist:{1:0,2:0,3:0,4:0,5:0,6:0,"-":0,"DNP":0}, fwScore:0, lastGenius:null, weeklyPts:[] }; });
  
  const weeklyMap = {};
  entries.forEach((e,idx) => {
    const weekNum = Math.floor(idx / 7);
    PLAYERS.forEach(p => {
      const g = e.guesses[p];
      if (g == null) return;
      const sc = toScore(g);
      stats[p].points += sc;
      stats[p].games++;
      stats[p].totalGuesses += (g === "-" || g === "X") ? 7 : g === "DNP" ? 7 : g;
      const dk = g === "X" ? "-" : String(g);
      if (stats[p].dist[dk] !== undefined) stats[p].dist[dk]++;
      if (g <= 3 && g >= 1) stats[p].lastGenius = e.date;
      if (!weeklyMap[weekNum]) weeklyMap[weekNum] = {};
      if (!weeklyMap[weekNum][p]) weeklyMap[weekNum][p] = 0;
      weeklyMap[weekNum][p] += sc;
    });
  });

  // 1st word scores per picker
  const fwByPicker = {};
  entries.forEach(e => {
    if (e.fw) {
      if (!fwByPicker[e.picker]) fwByPicker[e.picker] = { greens:0, yellows:0, grays:0, score:0, count:0 };
      fwByPicker[e.picker].greens += e.fw.greens;
      fwByPicker[e.picker].yellows += e.fw.yellows;
      fwByPicker[e.picker].grays += e.fw.grays;
      fwByPicker[e.picker].score += e.fw.score;
      fwByPicker[e.picker].count++;
    }
  });

  // Leaderboard
  const board = PLAYERS.map(p => ({
    name: p, points: stats[p].points, games: stats[p].games,
    avg: stats[p].games ? (stats[p].totalGuesses / stats[p].games) : 0,
    dist: stats[p].dist, lastGenius: stats[p].lastGenius
  })).sort((a,b) => {
    if (b.points !== a.points) return b.points - a.points;
    // Q1 uses tiebreakers; Q2+ allows true ties
    if (quarter === "Q1") {
      if (a.avg !== b.avg) return a.avg - b.avg;
      const aG = (a.dist[1]||0)+(a.dist[2]||0)+(a.dist[3]||0);
      const bG = (b.dist[1]||0)+(b.dist[2]||0)+(b.dist[3]||0);
      if (bG !== aG) return bG - aG;
      return b.games - a.games;
    }
    return 0;
  });

  // Day of week averages — count X/-/DNP as 7 so they raise the average
  const dowStats = {};
  DAYS_OF_WEEK.forEach(d => { dowStats[d] = { total:0, count:0 }; });
  entries.forEach(e => {
    PLAYERS.forEach(p => {
      const g = e.guesses[p];
      if (g == null) return;
      const val = (g === "-" || g === "X" || g === "DNP") ? 7 : g;
      dowStats[e.day].total += val;
      dowStats[e.day].count++;
    });
  });

  // Best/Worst days — same treatment
  const dayAvgs = entries.map(e => {
    let t=0, c=0;
    PLAYERS.forEach(p => { const g=e.guesses[p]; if(g!=null){ t += (g==="-"||g==="X"||g==="DNP") ? 7 : g; c++; } });
    return { ...e, avg: c ? t/c : 0, played: c };
  }).filter(d => d.played > 0);
  const bestDays = [...dayAvgs].sort((a,b) => a.avg - b.avg).slice(0,10);
  const worstDays = [...dayAvgs].sort((a,b) => b.avg - a.avg).slice(0,10);

  // Weekly trend data with date ranges
  const weeks = Object.keys(weeklyMap).sort((a,b)=>a-b).map(w => {
    const wi = parseInt(w);
    const obj = { week: wi+1 };
    // Calculate date range for this week
    const firstEntry = entries[wi*7];
    const lastEntry = entries[Math.min(wi*7+6, entries.length-1)];
    if (firstEntry && lastEntry) {
      const s = new Date(firstEntry.date+"T12:00:00");
      const e = new Date(lastEntry.date+"T12:00:00");
      obj.label = `${s.getMonth()+1}/${s.getDate()}–${e.getMonth()+1}/${e.getDate()}`;
    } else { obj.label = `Wk ${wi+1}`; }
    PLAYERS.forEach(p => { obj[p] = weeklyMap[w][p] || 0; });
    return obj;
  });

  return { board, stats, fwByPicker, dowStats, bestDays, worstDays, weeks, totalDays: entries.length };
}

// ─── COMPONENTS ──────────────────────────────────────────────
function Leaderboard({ board, totalDays, quarter }) {
  const maxPts = board[0]?.points || 1;
  const trophies = ["🥇","🥈","🥉"];
  const podiumColors = ["linear-gradient(135deg,rgba(255,215,0,.12),rgba(255,215,0,.03))","linear-gradient(135deg,rgba(192,192,192,.10),rgba(192,192,192,.02))","linear-gradient(135deg,rgba(205,127,50,.10),rgba(205,127,50,.02))"];
  const podiumBorders = ["rgba(255,215,0,.35)","rgba(192,192,192,.25)","rgba(205,127,50,.25)"];
  const barColors = ["#FFD700","#C0C0C0","#CD7F32","var(--green)","var(--green)","var(--yellow)","var(--yellow)"];
  const qEnd = new Date(Q_RANGES[quarter].end+"T23:59:59");
  const today = new Date();
  const daysLeft = Math.max(0, Math.ceil((qEnd - today) / (1000*60*60*24)));

  return (
    <div style={s.card}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div style={s.cardTitle}>Leaderboard</div>
        <div style={{display:"flex",gap:6,alignItems:"center"}}>
          <div style={{background:"var(--card2)",borderRadius:6,padding:"4px 10px",textAlign:"center"}}>
            <div style={{fontFamily:"'DM Mono',monospace",fontSize:14,fontWeight:700,color:"var(--white)",lineHeight:1.2}}>{totalDays}</div>
            <div style={{fontSize:7,color:"var(--text2)",letterSpacing:1,textTransform:"uppercase"}}>Days Played</div>
          </div>
          {daysLeft > 0 ? (
            <div style={{background:"var(--card2)",borderRadius:6,padding:"4px 10px",textAlign:"center"}}>
              <div style={{fontFamily:"'DM Mono',monospace",fontSize:14,fontWeight:700,color:"var(--yellow)",lineHeight:1.2}}>{daysLeft}</div>
              <div style={{fontSize:7,color:"var(--text2)",letterSpacing:1,textTransform:"uppercase"}}>Days Left</div>
            </div>
          ) : totalDays > 0 ? (
            <div style={{background:"rgba(106,170,100,.12)",borderRadius:6,padding:"4px 10px",textAlign:"center"}}>
              <div style={{fontFamily:"'DM Mono',monospace",fontSize:11,fontWeight:700,color:"var(--green)",lineHeight:1.2}}>FINAL</div>
            </div>
          ) : null}
        </div>
      </div>
      {board.map((p,i) => {
        // For Q1: no ties (tiebreakers handle it), rank = position
        // For Q2+: same points = same rank
        let displayRank = i + 1;
        const allowTies = quarter !== "Q1";
        if (allowTies && i > 0) {
          // Walk backwards to find the first person with this same score
          let r = i;
          while (r > 0 && board[r-1].points === p.points) r--;
          displayRank = r + 1;
        }
        
        const isPodium = displayRank <= 3;
        const podiumIdx = displayRank - 1;
        const geniusCount = (p.dist[1]||0) + (p.dist[2]||0) + (p.dist[3]||0);
        const missCount = (p.dist["-"]||0) + (p.dist["DNP"]||0);
        const barPct = maxPts > 0 ? (p.points / maxPts) * 100 : 0;
        const gamesBack = board[0].points - p.points;
        const geniusDays = p.lastGenius ? (() => { const t = new Date(); const g = new Date(p.lastGenius+"T12:00:00"); const td = new Date(t.getFullYear(),t.getMonth(),t.getDate()); const gd = new Date(g.getFullYear(),g.getMonth(),g.getDate()); return Math.round((td-gd)/(1000*60*60*24)); })() : 999;
        const isTied = allowTies && ((i > 0 && board[i-1].points === p.points) || (i < board.length-1 && board[i+1]?.points === p.points));
        
        return (
          <div key={p.name} style={{
            background: isPodium ? podiumColors[Math.min(podiumIdx,2)] : "transparent",
            border: isPodium ? `1px solid ${podiumBorders[Math.min(podiumIdx,2)]}` : "1px solid transparent",
            borderRadius: 10,
            padding: "10px 12px",
            marginBottom: 6,
            transition: "all .2s"
          }}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{fontSize:isPodium?24:16,width:32,textAlign:"center",flexShrink:0}}>
                {isPodium ? trophies[Math.min(podiumIdx,2)] : <span style={{fontFamily:"'DM Mono',monospace",fontWeight:800,color:"var(--text2)"}}>{displayRank}</span>}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",alignItems:"baseline",gap:8,marginBottom:3}}>
                  <span style={{fontWeight:700,fontSize:isPodium?16:14,color:"var(--white)"}}>{p.name}</span>
                  {isTied && <span style={{fontSize:9,color:"var(--yellow)",fontFamily:"'DM Mono',monospace",fontWeight:600}}>TIED</span>}
                </div>
                <div style={{height:5,borderRadius:3,background:"rgba(255,255,255,.06)",overflow:"hidden"}}>
                  <div style={{height:"100%",borderRadius:3,background:barColors[Math.min(isPodium?podiumIdx:i,6)]||"var(--green)",width:`${barPct}%`,transition:"width .6s ease"}}/>
                </div>
                <div style={{display:"flex",gap:10,marginTop:5,flexWrap:"wrap"}}>
                  <span style={{fontSize:10,color:"var(--text2)"}}>Avg <span style={{color:"var(--white)",fontFamily:"'DM Mono',monospace",fontWeight:600}}>{p.avg.toFixed(2)}</span></span>
                  <span style={{fontSize:10,color:"var(--text2)"}}>Genius <span style={{color:"var(--green)",fontFamily:"'DM Mono',monospace",fontWeight:600}}>{geniusCount}</span></span>
                  <span style={{fontSize:10,color:"var(--text2)"}}>Games <span style={{color:"var(--white)",fontFamily:"'DM Mono',monospace",fontWeight:600}}>{p.games}</span></span>
                  {missCount > 0 && <span style={{fontSize:10,color:"var(--text2)"}}>Missed <span style={{color:"#ff4444",fontFamily:"'DM Mono',monospace",fontWeight:600}}>{missCount}</span></span>}
                  {gamesBack > 0 && <span style={{fontSize:10,color:"var(--text2)"}}>Behind Leader <span style={{color:"var(--yellow)",fontFamily:"'DM Mono',monospace",fontWeight:600}}>-{gamesBack}</span></span>}
                </div>
                <div style={{marginTop:3}}>
                  <span style={{fontSize:10,color:"var(--text2)"}}>Last Genius <span style={{color:geniusDays<=3?"var(--green)":geniusDays<=7?"var(--yellow)":"#ff4444",fontFamily:"'DM Mono',monospace",fontWeight:600}}>{geniusDays===0?"Today":geniusDays===999?"Never":`${geniusDays}d ago`}</span></span>
                </div>
              </div>
              <div style={{textAlign:"right",flexShrink:0}}>
                <div style={{fontFamily:"'DM Mono',monospace",fontSize:isPodium?24:20,fontWeight:800,color:"var(--white)",lineHeight:1}}>{p.points}</div>
                <div style={{fontSize:9,color:"var(--text2)",letterSpacing:1,marginTop:2}}>PTS</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ScoreDistribution({ board }) {
  const labels = [
    {k:"1",name:"Super Super\nGenius",color:"#FFD700"},
    {k:"2",name:"Super\nGenius",color:"#6aaa64"},
    {k:"3",name:"Genius",color:"#6aaa64"},
    {k:"4",name:"Semi-\nBrave",color:"#b59f3b"},
    {k:"5",name:"Brave",color:"#b59f3b"},
    {k:"6",name:"Braver",color:"#787c7e"},
    {k:"-",name:"Bravest\n(X)",color:"#3a3a3c"},
    {k:"DNP",name:"No\nShow",color:"#ff4444"},
  ];
  return (
    <div style={s.card}>
      <div style={s.cardTitle}>Score Distribution</div>
      {board.map(p => {
        const max = Math.max(...labels.map(l=>p.dist[l.k]||0), 1);
        return (
          <div key={p.name} style={{marginBottom:14}}>
            <div style={{fontSize:12,fontWeight:700,marginBottom:6}}>{p.name} <span style={{color:"var(--text2)",fontWeight:400}}>({p.points} pts)</span></div>
            <div style={{display:"flex",gap:3,alignItems:"flex-end",height:36}}>
              {labels.map(l => {
                const v = p.dist[l.k] || 0;
                const h = Math.max(4, (v/max)*36);
                return (
                  <div key={l.k} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center"}}>
                    <div style={{flex:1,display:"flex",alignItems:"flex-end",width:"100%"}}>
                      <div style={{width:"100%",height:h,background:l.color,borderRadius:2,transition:"height .3s"}}/>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{display:"flex",gap:3,marginTop:3}}>
              {labels.map(l => {
                const v = p.dist[l.k] || 0;
                return (
                  <div key={l.k} style={{flex:1,textAlign:"center"}}>
                    <div style={{fontSize:7,color:"var(--text2)",lineHeight:1.2,height:22,display:"flex",alignItems:"center",justifyContent:"center",whiteSpace:"pre-line"}}>{l.name}</div>
                    <div style={{fontSize:9,fontFamily:"'DM Mono',monospace",color:"var(--text2)"}}>{v}</div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function FirstWordRankings({ fwByPicker }) {
  const ranked = Object.entries(fwByPicker).map(([name,d])=>({name,...d})).sort((a,b)=>b.score-a.score);
  const trophies = ["🥇","🥈","🥉"];
  const maxScore = ranked[0]?.score || 1;
  return (
    <div style={s.card}>
      <div style={s.cardTitle}>1st Word Rankings</div>
      <div style={{fontSize:10,color:"var(--text2)",marginBottom:10}}>2 pts per green letter · 1 pt per yellow · 0 pts per gray</div>
      {ranked.map((p,i) => {
        const barPct = (p.score / maxScore) * 100;
        return (
          <div key={p.name} style={{padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,.04)"}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:i<3?16:12,width:22,textAlign:"center",flexShrink:0}}>{i<3?trophies[i]:<span style={{fontFamily:"'DM Mono',monospace",fontWeight:800,color:"var(--text2)"}}>{i+1}</span>}</span>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",marginBottom:3}}>
                  <span style={{fontWeight:700,fontSize:14}}>{p.name}</span>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontFamily:"'DM Mono',monospace",fontSize:16,fontWeight:800,color:"var(--white)",lineHeight:1}}>{p.score}</div>
                    <div style={{fontSize:8,color:"var(--text2)",letterSpacing:.5}}>1st Word Pts</div>
                  </div>
                </div>
                <div style={{height:5,borderRadius:3,background:"rgba(255,255,255,.06)",overflow:"hidden",marginBottom:4}}>
                  <div style={{height:"100%",borderRadius:3,background:"var(--green)",width:`${barPct}%`,transition:"width .6s ease"}}/>
                </div>
                <div style={{display:"flex",gap:4}}>
                  <span style={{fontSize:10,color:"var(--text2)"}}>Green <span style={{color:"var(--green)",fontFamily:"'DM Mono',monospace",fontWeight:600}}>{p.greens}</span></span>
                  <span style={{fontSize:10,color:"var(--text2)"}}>· Yellow <span style={{color:"var(--yellow)",fontFamily:"'DM Mono',monospace",fontWeight:600}}>{p.yellows}</span></span>
                  <span style={{fontSize:10,color:"var(--text2)"}}>· Gray <span style={{color:"var(--dgray)",fontFamily:"'DM Mono',monospace",fontWeight:600}}>{p.grays}</span></span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function BestWorstDays({ bestDays, worstDays }) {
  const hdr = {fontSize:9,color:"var(--text2)",fontWeight:600,padding:"0 0 6px",borderBottom:"1px solid rgba(255,255,255,.06)"};
  const renderList = (days, label, color) => (
    <div style={{flex:1,minWidth:260}}>
      <div style={{...s.cardTitle,color,marginBottom:10}}>{label}</div>
      <div style={{display:"grid",gridTemplateColumns:"18px 1fr 1fr 1fr 1fr",gap:4,alignItems:"center",...hdr}}>
        <span/>
        <span style={{textAlign:"center"}}>Date</span>
        <span style={{textAlign:"center",color:"var(--yellow)"}}>1st Word</span>
        <span style={{textAlign:"center",color:"var(--green)"}}>Answer</span>
        <span style={{textAlign:"center"}}>Average</span>
      </div>
      {days.map((d,i) => (
        <div key={d.date} style={{display:"grid",gridTemplateColumns:"18px 1fr 1fr 1fr 1fr",gap:4,alignItems:"center",padding:"6px 0",borderBottom:"1px solid rgba(255,255,255,.04)"}}>
          <span style={{fontFamily:"'DM Mono',monospace",color:"var(--text2)",fontSize:11}}>{i+1}.</span>
          <span style={{fontSize:11,textAlign:"center"}}>{fmtDate(d.date)}</span>
          <span style={{fontFamily:"'DM Mono',monospace",fontSize:10,letterSpacing:1,color:"var(--yellow)",textAlign:"center"}}>{d.firstWord}</span>
          <span style={{fontFamily:"'DM Mono',monospace",fontSize:10,letterSpacing:1,color:"var(--green)",textAlign:"center"}}>{d.answer}</span>
          <span style={{fontFamily:"'DM Mono',monospace",color,fontWeight:700,fontSize:13,textAlign:"center"}}>{d.avg.toFixed(2)}</span>
        </div>
      ))}
    </div>
  );
  return (
    <div style={s.card}>
      <div style={{display:"flex",gap:24,flexWrap:"wrap"}}>
        {renderList(bestDays, "Best Days (Easiest)", "var(--green)")}
        {renderList(worstDays, "Hardest Days", "#ff4444")}
      </div>
    </div>
  );
}

function DayOfWeekStats({ dowStats }) {
  const data = DAYS_OF_WEEK.map(d => ({ day: d, avg: dowStats[d].count ? dowStats[d].total/dowStats[d].count : 0, picker: DAY_ASSIGN[d] }));
  const maxAvg = Math.max(...data.map(d=>d.avg), 1);
  return (
    <div style={s.card}>
      <div style={s.cardTitle}>Average Score by Day of Week</div>
      <div style={{display:"flex",flexDirection:"column",gap:8,marginTop:8}}>
        {data.map(d => {
          const pct = (d.avg / 7) * 100;
          const color = "var(--green)";
          return (
            <div key={d.day}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:3}}>
                <div style={{fontSize:12}}>
                  <span style={{fontWeight:700}}>{d.day}</span>
                  <span style={{color:"var(--text2)",fontSize:10,marginLeft:6}}>({d.picker})</span>
                </div>
                <span style={{fontFamily:"'DM Mono',monospace",fontSize:13,fontWeight:700,color}}>{d.avg.toFixed(2)}</span>
              </div>
              <div style={{height:10,background:"rgba(255,255,255,.04)",borderRadius:4,overflow:"hidden"}}>
                <div style={{height:"100%",background:color,borderRadius:4,width:`${pct}%`,transition:"width .4s"}}/>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{fontSize:10,color:"var(--text2)",marginTop:10}}>Missed days (X or DNP) count as 7 guesses, raising the average</div>
    </div>
  );
}

function WeeklyTrend({ weeks }) {
  const colorMap = { Brandon:"#6aaa64", Geoff:"#FF69B4", Jose:"#FFD700", Josh:"#00CFFF", Benjy:"#A78BFA", Michelle:"#EF4444", Steph:"#FF9500" };
  const colors = PLAYERS.map(p => colorMap[p]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    const sorted = [...payload].sort((a, b) => b.value - a.value);
    return (
      <div style={{background:"#262626",border:"1px solid #3a3a3c",borderRadius:8,padding:"8px 10px",fontSize:11}}>
        <div style={{fontWeight:700,marginBottom:4,color:"var(--text2)"}}>Week: {label}</div>
        {sorted.map((entry, i) => (
          <div key={entry.name} style={{display:"flex",alignItems:"center",gap:6,padding:"2px 0"}}>
            <span style={{fontFamily:"'DM Mono',monospace",fontSize:10,fontWeight:700,color:"var(--text2)",width:14}}>{i+1}.</span>
            <span style={{width:8,height:8,borderRadius:"50%",background:entry.color,flexShrink:0}}/>
            <span style={{flex:1,color:"var(--text)"}}>{entry.name}</span>
            <span style={{fontFamily:"'DM Mono',monospace",fontWeight:700,color:"var(--white)"}}>{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={s.card}>
      <div style={s.cardTitle}>Weekly Points Trend</div>
      <div style={{fontSize:10,color:"var(--text2)",marginBottom:8}}>Tap or hover on a point to see scores for that week</div>
      <div style={{height:240}}>
        <ResponsiveContainer>
          <LineChart data={weeks} margin={{top:5,right:5,bottom:20,left:-15}}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.05)"/>
            <XAxis dataKey="label" tick={{fill:"#818384",fontSize:8}} axisLine={false} tickLine={false} angle={-30} textAnchor="end" interval={0} height={40}/>
            <YAxis tick={{fill:"#818384",fontSize:10}} axisLine={false} tickLine={false}/>
            <Tooltip content={<CustomTooltip/>}/>
            {PLAYERS.map((p,i) => <Line key={p} type="monotone" dataKey={p} stroke={colors[i]} strokeWidth={2} dot={{r:3,strokeWidth:0,fill:colors[i]}} activeDot={{r:5}}/>)}
            <Legend wrapperStyle={{fontSize:10}}/>
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function RecentResults({ entries }) {
  const recent = [...entries].reverse().slice(0,7);
  const th = {textAlign:"center",padding:"6px 3px",color:"var(--text2)",fontWeight:600,fontSize:9,borderBottom:"1px solid var(--border)",whiteSpace:"nowrap"};
  return (
    <div style={s.card}>
      <div style={s.cardTitle}>Recent Results</div>
      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:12,tableLayout:"fixed"}}>
          <colgroup>
            <col style={{width:"10%"}}/>
            <col style={{width:"11%"}}/>
            <col style={{width:"11%"}}/>
            {PLAYERS.map(p => <col key={p} style={{width:`${68/7}%`}}/>)}
          </colgroup>
          <thead>
            <tr>
              <th style={{...th,textAlign:"left"}}>Date</th>
              <th style={{...th,textAlign:"left",color:"var(--yellow)"}}>1st Word</th>
              <th style={{...th,textAlign:"left",color:"var(--green)"}}>Answer</th>
              {PLAYERS.map(p => <th key={p} style={th}>{p}</th>)}
            </tr>
          </thead>
          <tbody>
            {recent.map(e => (
              <tr key={e.date}>
                <td style={{padding:"5px 3px",fontSize:10,color:"var(--text2)",whiteSpace:"nowrap",overflow:"hidden"}}>{fmtDate(e.date)}</td>
                <td style={{padding:"5px 3px",fontFamily:"'DM Mono',monospace",fontWeight:600,fontSize:9,letterSpacing:1,color:"var(--yellow)",overflow:"hidden"}}>{e.firstWord||"—"}</td>
                <td style={{padding:"5px 3px",fontFamily:"'DM Mono',monospace",fontWeight:700,fontSize:9,letterSpacing:1,color:"var(--green)",overflow:"hidden"}}>{e.answer||"—"}</td>
                {PLAYERS.map(p => {
                  const g = e.guesses[p];
                  const bg = g==null?"transparent":g<=2?"var(--green)":g===3?"var(--green)":g<=4?"var(--yellow)":g<=5?"var(--dgray)":"var(--gray)";
                  const c = g==null?"var(--text2)":g<=5?"#000":"var(--text)";
                  return <td key={p} style={{padding:"4px 2px",textAlign:"center"}}><span style={{display:"inline-block",width:22,height:22,lineHeight:"22px",borderRadius:4,fontFamily:"'DM Mono',monospace",fontWeight:700,fontSize:11,background:bg,color:c}}>{g==null?"":g==="-"?"X":g}</span></td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ScoreEntry({ onSave, entries }) {
  const today = (() => { const d = new Date(); const y = d.getFullYear(); const m = String(d.getMonth()+1).padStart(2,"0"); const day = String(d.getDate()).padStart(2,"0"); return y+"-"+m+"-"+day; })();
  const [date, setDate] = useState(today);
  const [answer, setAnswer] = useState("");
  const [firstWord, setFirstWord] = useState("");
  const [fwGreens, setFwGreens] = useState(0);
  const [fwYellows, setFwYellows] = useState(0);
  const [guesses, setGuesses] = useState({});
  const [saveState, setSaveState] = useState("idle"); // idle | saving | saved | error
  const [errorMsg, setErrorMsg] = useState("");

  const dayOfWeek = getDayOfWeek(date);
  const picker = DAY_ASSIGN[dayOfWeek] || "—";
  const existing = entries.find(e => e.date === date);

  useEffect(() => {
    if (existing) {
      setAnswer(existing.answer || "");
      setFirstWord(existing.firstWord || "");
      setFwGreens(existing.fw?.greens || 0);
      setFwYellows(existing.fw?.yellows || 0);
      setGuesses(existing.guesses || {});
    } else {
      setAnswer(""); setFirstWord(""); setFwGreens(0); setFwYellows(0); setGuesses({});
    }
    setSaveState("idle");
  }, [date]);

  const handleSave = async () => {
    setSaveState("saving");
    setErrorMsg("");
    
    const payload = {
      date,
      firstWord: firstWord.toUpperCase() || "",
      answer: answer.toUpperCase() || "",
      greens: firstWord ? fwGreens : "",
      yellows: firstWord ? fwYellows : "",
      guesses: {}
    };
    
    // Only send guesses that have actual values — empty ones are skipped
    // so they don't overwrite existing data in the sheet
    PLAYERS.forEach(p => {
      const g = guesses[p];
      if (g === null || g === undefined) payload.guesses[p] = "";
      else if (g === "-") payload.guesses[p] = "X";
      else payload.guesses[p] = String(g);
    });
    
    try {
      const res = await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      
      if (result.success) {
        const updatedCount = result.updated ? result.updated.length : 0;
        // Also update local state so dashboard reflects immediately
        const fwGrays = 5 - fwGreens - fwYellows;
        const entry = {
          date, day: dayOfWeek, picker, firstWord: firstWord.toUpperCase(), answer: answer.toUpperCase(),
          guesses,
          fw: { greens: fwGreens, yellows: fwYellows, grays: Math.max(0, fwGrays), score: fwGreens*2 + fwYellows }
        };
        onSave(entry);
        setSaveState("saved");
        setErrorMsg(updatedCount > 0 ? `Saved ${updatedCount} score${updatedCount===1?"":"s"} to Google Sheets!` : "Saved to Google Sheets!");
        setTimeout(() => setSaveState("idle"), 3000);
      } else {
        setSaveState("error");
        setErrorMsg(result.error || "Unknown error");
      }
    } catch (err) {
      setSaveState("error");
      setErrorMsg("Failed to connect to Google Sheets. Check your connection and try again.");
    }
  };

  const setGuess = (p, val) => {
    const v = val === "" ? null : val === "-" || val === "X" ? "-" : val === "DNP" ? "DNP" : parseInt(val);
    setGuesses(prev => ({ ...prev, [p]: v }));
  };

  return (
    <div style={s.card}>
      <div style={s.cardTitle}>Enter / Edit Daily Scores</div>
      <div style={{display:"flex",gap:12,marginBottom:16,flexWrap:"wrap",alignItems:"flex-end"}}>
        <div>
          <label style={{fontSize:10,color:"var(--text2)",display:"block",marginBottom:4}}>Date</label>
          <input type="date" value={date} onChange={e=>setDate(e.target.value)} style={{...s.input,width:"auto"}}/>
        </div>
        <div>
          <label style={{fontSize:10,color:"var(--text2)",display:"block",marginBottom:4}}>Day / Picker</label>
          <div style={{...s.input,background:"var(--card2)",display:"inline-flex",alignItems:"center",gap:6,width:"auto"}}>
            <span style={{fontSize:13,fontWeight:600}}>{dayOfWeek}</span>
            <span style={{color:"var(--text2)"}}>·</span>
            <span style={{color:"var(--green)",fontWeight:700,fontSize:13}}>{picker}</span>
          </div>
        </div>
      </div>
      <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
        <div style={{flex:1,minWidth:120}}>
          <label style={{fontSize:10,color:"var(--text2)",display:"block",marginBottom:4}}>1st Word</label>
          <input value={firstWord} onChange={e=>setFirstWord(e.target.value.toUpperCase().slice(0,5))} maxLength={5} placeholder="WORD" style={{...s.input,fontFamily:"'DM Mono',monospace",letterSpacing:4,textTransform:"uppercase"}}/>
        </div>
        <div style={{flex:1,minWidth:120}}>
          <label style={{fontSize:10,color:"var(--text2)",display:"block",marginBottom:4}}>Answer</label>
          <input value={answer} onChange={e=>setAnswer(e.target.value.toUpperCase().slice(0,5))} maxLength={5} placeholder="ANSWER" style={{...s.input,fontFamily:"'DM Mono',monospace",letterSpacing:4,textTransform:"uppercase"}}/>
        </div>
      </div>
      <div style={{display:"flex",gap:8,marginBottom:16}}>
        <div>
          <label style={{fontSize:10,color:"var(--green)",display:"block",marginBottom:4}}>Greens</label>
          <select value={fwGreens} onChange={e=>setFwGreens(parseInt(e.target.value))} style={{...s.input,width:56,textAlign:"center"}}>{[0,1,2,3,4,5].map(n=><option key={n} value={n}>{n}</option>)}</select>
        </div>
        <div>
          <label style={{fontSize:10,color:"var(--yellow)",display:"block",marginBottom:4}}>Yellows</label>
          <select value={fwYellows} onChange={e=>setFwYellows(parseInt(e.target.value))} style={{...s.input,width:56,textAlign:"center"}}>{[0,1,2,3,4,5].map(n=><option key={n} value={n}>{n}</option>)}</select>
        </div>
        <div style={{display:"flex",alignItems:"flex-end",paddingBottom:2}}>
          <span style={{fontSize:11,color:"var(--text2)"}}>= <span style={{fontFamily:"'DM Mono',monospace",color:"var(--white)",fontWeight:700}}>{fwGreens*2+fwYellows}</span> pts</span>
        </div>
      </div>
      <div style={{marginBottom:16}}>
        <label style={{fontSize:10,color:"var(--text2)",display:"block",marginBottom:8}}>Player Guesses (1-6, X for failed attempt, DNP for no show)</label>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:6}}>
          {PLAYERS.map(p => (
            <div key={p} style={{display:"flex",alignItems:"center",gap:6,background:"var(--card2)",borderRadius:6,padding:"6px 8px"}}>
              <span style={{fontSize:11,fontWeight:600,flex:1}}>{p}</span>
              <select value={guesses[p]==null?"":guesses[p]==="-"?"X":guesses[p]==="DNP"?"DNP":guesses[p]} onChange={e=>setGuess(p,e.target.value)} style={{...s.input,width:56,padding:"4px 2px",textAlign:"center",fontSize:11}}>
                <option value="">—</option>
                {[1,2,3,4,5,6].map(n=><option key={n} value={n}>{n}</option>)}
                <option value="X">X (failed)</option>
                <option value="DNP">DNP</option>
              </select>
              {guesses[p]!=null && <span style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:guesses[p]==="DNP"?"#ff4444":"var(--green)",fontWeight:700,minWidth:20,textAlign:"right"}}>{toScore(guesses[p])}</span>}
            </div>
          ))}
        </div>
      </div>
      <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
        <button onClick={handleSave} disabled={saveState==="saving"} style={{...s.btn,opacity:saveState==="saving"?0.6:1,cursor:saveState==="saving"?"wait":"pointer"}}>
          {saveState==="saving" ? "Saving to Google Sheets..." : existing ? "Update Scores" : "Save Scores"}
        </button>
        {saveState==="saved" && <span style={{color:"var(--green)",fontSize:12,fontWeight:700}}>{errorMsg}</span>}
        {saveState==="error" && <span style={{color:"#ff4444",fontSize:11,fontWeight:600}}>{errorMsg}</span>}
      </div>
    </div>
  );
}

function FullHistory({ entries }) {
  const [expanded, setExpanded] = useState(null);
  const months = {};
  entries.forEach(e => { const m = e.date.slice(0,7); if (!months[m]) months[m]=[]; months[m].push(e); });
  const sortedMonths = Object.keys(months).sort().reverse();
  const hth = {padding:"4px 2px",color:"var(--text2)",fontSize:7,borderBottom:"1px solid var(--border)",whiteSpace:"nowrap",textAlign:"center"};

  return (
    <div style={s.card}>
      <div style={s.cardTitle}>Full History</div>
      {sortedMonths.map(m => {
        const label = new Date(m+"-15T12:00:00").toLocaleDateString("en-US",{month:"long",year:"numeric"});
        return (
          <div key={m} style={{marginBottom:8}}>
            <div onClick={()=>setExpanded(expanded===m?null:m)} style={{cursor:"pointer",padding:"8px 0",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:"1px solid rgba(255,255,255,.05)"}}>
              <span style={{fontWeight:700,fontSize:13}}>{label}</span>
              <span style={{fontSize:11,color:"var(--text2)"}}>{months[m].length} days {expanded===m?"▾":"▸"}</span>
            </div>
            {expanded===m && (
              <div style={{overflowX:"auto",marginTop:4}}>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:11,tableLayout:"fixed"}}>
                  <colgroup>
                    <col style={{width:"8%"}}/>
                    <col style={{width:"10%"}}/>
                    <col style={{width:"10%"}}/>
                    {PLAYERS.map(p=><col key={p} style={{width:`${72/8}%`}}/>)}
                    <col style={{width:"9%"}}/>
                  </colgroup>
                  <thead><tr>
                    <th style={{...hth,textAlign:"center"}}>Date</th>
                    <th style={{...hth,textAlign:"center",color:"var(--yellow)"}}>1st Word</th>
                    <th style={{...hth,textAlign:"center",color:"var(--green)"}}>Answer</th>
                    {PLAYERS.map(p=><th key={p} style={{...hth,textAlign:"center"}}>{p}</th>)}
                    <th style={{...hth,textAlign:"center"}}>Avg</th>
                  </tr></thead>
                  <tbody>
                    {months[m].map(e => {
                      let t=0,c=0;
                      PLAYERS.forEach(p=>{const g=e.guesses[p];if(g!=null){t+=(g==="-"||g==="X"||g==="DNP")?7:g;c++;}});
                      const avg=c?t/c:0;
                      return (
                        <tr key={e.date}>
                          <td style={{padding:2,fontSize:8,color:"var(--text2)",textAlign:"center",whiteSpace:"nowrap"}}>{fmtDate(e.date)}</td>
                          <td style={{padding:2,fontFamily:"'DM Mono',monospace",fontSize:7,letterSpacing:.5,color:"var(--yellow)",textAlign:"center"}}>{e.firstWord||"—"}</td>
                          <td style={{padding:2,fontFamily:"'DM Mono',monospace",fontSize:7,letterSpacing:.5,color:"var(--green)",textAlign:"center"}}>{e.answer||"—"}</td>
                          {PLAYERS.map(p=>{
                            const g=e.guesses[p];
                            const bg=g==null?"transparent":g==="DNP"?"#ff4444":g<=3?"var(--green)":g<=4?"var(--yellow)":g<=5?"var(--dgray)":"var(--gray)";
                            const txt=g==null?"":g==="-"?"X":g==="DNP"?"—":g;
                            return <td key={p} style={{padding:1,textAlign:"center"}}><span style={{display:"inline-block",width:16,height:16,lineHeight:"16px",borderRadius:3,fontSize:9,fontWeight:700,fontFamily:"'DM Mono',monospace",background:bg,color:g!=null&&g<=5&&g!=="DNP"?"#000":"var(--text)"}}>{txt}</span></td>;
                          })}
                          <td style={{padding:2,textAlign:"center",fontFamily:"'DM Mono',monospace",fontSize:8,color:"var(--text2)"}}>{avg.toFixed(1)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── MAIN APP ────────────────────────────────────────────────
export default function App() {
  const [quarter, setQuarter] = useState(() => { const m = new Date().getMonth(); return m < 3 ? "Q1" : m < 6 ? "Q2" : m < 9 ? "Q3" : "Q4"; });
  const [tab, setTab] = useState("dashboard");
  const [allData, setAllData] = useState({ Q1:[], Q2:[], Q3:[], Q4:[] });
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const isAdmin = (() => { try { return new URLSearchParams(window.location.search).get("mode") === "manage"; } catch { return false; } })();

  useEffect(() => {
    (async () => {
      const sheetData = await fetchSheetData();
      if (sheetData) {
        setAllData(prev => {
          const merged = { ...prev };
          ["Q1","Q2","Q3","Q4"].forEach(q => {
            if (sheetData[q] && sheetData[q].length > 0) merged[q] = sheetData[q];
          });
          // Fallback: if sheet had no Q1 data, use hardcoded
          if (merged.Q1.length === 0) merged.Q1 = Q1_DATA;
          return merged;
        });
      } else {
        setAllData({ Q1:Q1_DATA, Q2:[], Q3:[], Q4:[] });
        setLoadError(true);
      }
      setLoaded(true);
    })();
  }, []);

  const handleSaveEntry = useCallback((entry) => {
    const q = getQuarterForDate(entry.date);
    setAllData(prev => {
      const arr = [...(prev[q]||[])];
      const idx = arr.findIndex(e => e.date === entry.date);
      if (idx >= 0) arr[idx] = entry; else arr.push(entry);
      arr.sort((a,b) => a.date.localeCompare(b.date));
      return { ...prev, [q]: arr };
    });
  }, []);

  const [refreshing, setRefreshing] = useState(false);
  const refreshData = async () => {
    setRefreshing(true);
    const sheetData = await fetchSheetData();
    if (sheetData) {
      setAllData(prev => {
        const merged = { ...prev };
        ["Q1","Q2","Q3","Q4"].forEach(q => {
          if (sheetData[q] && sheetData[q].length > 0) merged[q] = sheetData[q];
        });
        if (merged.Q1.length === 0) merged.Q1 = Q1_DATA;
        return merged;
      });
    }
    setRefreshing(false);
  };

  const entries = allData[quarter] || [];
  const computed = computeStats(entries, quarter);

  const tabs = [
    { id:"dashboard", label:"Dashboard" },
    ...(isAdmin ? [{ id:"enter", label:"Enter Scores" }] : []),
    { id:"history", label:"History" },
  ];

  return (
    <div style={s.app}>
      <style>{CSS}</style>
      <div style={{...s.header,display:"flex",alignItems:"center",justifyContent:"center",position:"relative"}}>
        <div style={{textAlign:"center"}}>
          <div style={s.title}>
            <span style={s.titleTile("var(--green)")}>W</span>
            <span style={s.titleTile()}>H</span>
            <span style={s.titleTile()}>O</span>
            <span style={s.titleTile()}>R</span>
            <span style={s.titleTile()}>D</span>
            <span style={s.titleTile()}>L</span>
            <span style={s.titleTile()}>E</span>
          </div>
          {isAdmin && <div style={{fontSize:9,color:"var(--green)",marginTop:4,letterSpacing:2,textTransform:"uppercase",border:"1px solid var(--green)",borderRadius:4,display:"inline-block",padding:"1px 8px"}}>ADMIN</div>}
        </div>
        <button onClick={refreshData} disabled={refreshing} style={{position:"absolute",right:16,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",padding:6,fontSize:18,color:refreshing?"var(--text2)":"var(--green)",transition:"transform .3s"}} title="Refresh scores">
          <span className={refreshing?"refreshing":""} style={{display:"inline-block"}}>↻</span>
        </button>
      </div>
      {!loaded ? (
        <div style={{textAlign:"center",padding:60}}>
          <div style={{fontSize:24,marginBottom:12}}>🟩🟨⬜</div>
          <div style={{fontSize:14,fontWeight:600,color:"var(--text2)"}}>Loading scores...</div>
        </div>
      ) : (
      <>
      <div style={s.qTabs}>
        {["Q1","Q2","Q3","Q4"].map(q => (
          <button key={q} style={s.qTab(quarter===q)} onClick={()=>{ setQuarter(q); setTab("dashboard"); }}>{q}</button>
        ))}
      </div>
      <div style={s.nav}>
        {tabs.map(t => <button key={t.id} style={s.navBtn(tab===t.id)} onClick={()=>setTab(t.id)}>{t.label}</button>)}
      </div>
      <div style={s.content}>
        {entries.length === 0 && tab === "dashboard" ? (
          <div style={{...s.card,textAlign:"center",padding:40}}>
            <div style={{fontSize:40,marginBottom:12}}>🟩</div>
            <div style={{fontSize:16,fontWeight:700,marginBottom:8}}>No data yet for {quarter}</div>
            <div style={{fontSize:12,color:"var(--text2)",marginBottom:16}}>{isAdmin ? "Start entering scores to see the dashboard come alive!" : "Scores will appear here once the competition begins!"}</div>
            {isAdmin && <button style={s.btn} onClick={()=>setTab("enter")}>Enter Scores</button>}
          </div>
        ) : tab === "dashboard" ? (
          <>
            <Leaderboard board={computed.board} totalDays={computed.totalDays} quarter={quarter}/>
            <RecentResults entries={entries}/>
            <ScoreDistribution board={computed.board}/>
            <FirstWordRankings fwByPicker={computed.fwByPicker}/>
            <WeeklyTrend weeks={computed.weeks}/>
            <DayOfWeekStats dowStats={computed.dowStats}/>
            <BestWorstDays bestDays={computed.bestDays} worstDays={computed.worstDays}/>
          </>
        ) : tab === "enter" ? (
          <ScoreEntry onSave={handleSaveEntry} entries={entries}/>
        ) : (
          <FullHistory entries={entries}/>
        )}
      </div>
      </>
      )}
    </div>
  );
}
