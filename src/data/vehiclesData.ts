import { VehicleMapping } from "../types/tyre";

export const VEHICLE_MAKES = [
  "Perodua",
  "Proton",
  "Toyota",
  "Honda",
  "Nissan",
  "Mazda",
  "Mitsubishi",
  "Ford",
  "BMW",
  "Mercedes-Benz",
  "Hyundai",
  "Kia"
];

export const VEHICLE_DATABASE: VehicleMapping[] = [
  // PERODUA
  {
    id: "perodua-myvi-gen3",
    make: "Perodua",
    model: "Myvi (Gen 3 / Facelift)",
    yearRange: "2018 - 2026",
    oeSize: "185/55R15",
    upgradeSizes: ["195/55R15", "195/50R16", "205/45R17"],
    recommendedCategory: "Passenger",
    popularModels: ["Goodyear AMG", "Michelin XM2+", "Nexen N Fera SU4", "Hankook K435", "Toyo CR1"]
  },
  {
    id: "perodua-myvi-gen2",
    make: "Perodua",
    model: "Myvi (Gen 1 / Gen 2)",
    yearRange: "2005 - 2017",
    oeSize: "175/65R14",
    upgradeSizes: ["185/60R14", "185/55R15", "195/55R15"],
    recommendedCategory: "Passenger",
    popularModels: ["Goodyear ADP2", "Autogreen SC1", "Duraturn Mozzo", "Hankook K435"]
  },
  {
    id: "perodua-bezza",
    make: "Perodua",
    model: "Bezza",
    yearRange: "2016 - 2026",
    oeSize: "175/65R14",
    upgradeSizes: ["185/60R14", "185/55R15"],
    recommendedCategory: "Passenger",
    popularModels: ["Goodyear ADP2", "Hankook K435", "Kingboss G521"]
  },
  {
    id: "perodua-axia",
    make: "Perodua",
    model: "Axia",
    yearRange: "2014 - 2026",
    oeSize: "175/65R14",
    upgradeSizes: ["185/55R15"],
    recommendedCategory: "Passenger",
    popularModels: ["Goodyear ADP2", "Autogreen SC1", "Hankook K435"]
  },
  {
    id: "perodua-ativa",
    make: "Perodua",
    model: "Ativa",
    yearRange: "2021 - 2026",
    oeSize: "205/60R17",
    upgradeSizes: ["215/55R17", "215/60R17"],
    recommendedCategory: "SUV / Crossover",
    popularModels: ["Continental UC6", "Goodyear AMG SUV", "Hankook K135"]
  },
  {
    id: "perodua-alza-new",
    make: "Perodua",
    model: "Alza (W100)",
    yearRange: "2022 - 2026",
    oeSize: "205/55R16",
    upgradeSizes: ["215/50R17"],
    recommendedCategory: "Passenger",
    popularModels: ["Goodyear AMG", "Nexen N Fera SU4", "Autogreen SC1", "Toyo CR1"]
  },

  // PROTON
  {
    id: "proton-saga-vvt",
    make: "Proton",
    model: "Saga VVT",
    yearRange: "2016 - 2026",
    oeSize: "185/55R15",
    upgradeSizes: ["195/55R15"],
    recommendedCategory: "Passenger",
    popularModels: ["Goodyear AMG", "Hankook K435", "Nexen N Fera SU4"]
  },
  {
    id: "proton-persona",
    make: "Proton",
    model: "Persona (VVT)",
    yearRange: "2016 - 2026",
    oeSize: "185/55R15",
    upgradeSizes: ["195/55R15", "205/50R16"],
    recommendedCategory: "Passenger",
    popularModels: ["Continental CC7", "Michelin XM2+", "Goodyear AMG"]
  },
  {
    id: "proton-x50",
    make: "Proton",
    model: "X50 (Executive / Premium / Flagship)",
    yearRange: "2020 - 2026",
    oeSize: "215/60R17",
    upgradeSizes: ["225/55R18", "235/50R18"],
    recommendedCategory: "SUV / Crossover",
    popularModels: ["Goodyear AMG SUV", "Continental UC6", "Michelin Primacy 5"]
  },
  {
    id: "proton-x70",
    make: "Proton",
    model: "X70",
    yearRange: "2018 - 2026",
    oeSize: "225/60R18",
    upgradeSizes: ["235/55R19"],
    recommendedCategory: "SUV / Crossover",
    popularModels: ["Goodyear AMG SUV", "Michelin Primacy 5", "Nexen RU1"]
  },

  // TOYOTA
  {
    id: "toyota-vios-2022",
    make: "Toyota",
    model: "Vios",
    yearRange: "2019 - 2026",
    oeSize: "205/55R16",
    upgradeSizes: ["195/55R15", "205/50R17"],
    recommendedCategory: "Passenger",
    popularModels: ["Goodyear AMG", "Continental CC7", "Toyo CR1", "Autogreen SC1"]
  },
  {
    id: "toyota-corolla-cross",
    make: "Toyota",
    model: "Corolla Cross",
    yearRange: "2021 - 2026",
    oeSize: "215/60R17",
    upgradeSizes: ["225/50R18"],
    recommendedCategory: "SUV / Crossover",
    popularModels: ["Goodyear AMG SUV", "Hankook K135", "Michelin Primacy 5"]
  },
  {
    id: "toyota-hilux",
    make: "Toyota",
    model: "Hilux Revo / Rocco",
    yearRange: "2016 - 2026",
    oeSize: "265/65R17",
    upgradeSizes: ["265/60R18", "275/65R18"],
    recommendedCategory: "4x4 / Offroad",
    popularModels: ["Hankook Dynapro AT2", "Autogreen Grandtour AT22"]
  },
  {
    id: "toyota-camry",
    make: "Toyota",
    model: "Camry (XV70)",
    yearRange: "2019 - 2026",
    oeSize: "235/45R18",
    upgradeSizes: ["245/40R19"],
    recommendedCategory: "Passenger",
    popularModels: ["Michelin Primacy 5", "Continental UC6", "Bridgestone Turanza 6"]
  },

  // HONDA
  {
    id: "honda-city-gn2",
    make: "Honda",
    model: "City (GN2 / Hatchback)",
    yearRange: "2020 - 2026",
    oeSize: "185/55R16",
    upgradeSizes: ["205/50R16", "205/55R16"],
    recommendedCategory: "Passenger",
    popularModels: ["Goodyear AMG", "Continental CC7", "Toyo CR1"]
  },
  {
    id: "honda-civic-fe",
    make: "Honda",
    model: "Civic FE / FC",
    yearRange: "2016 - 2026",
    oeSize: "215/50R17",
    upgradeSizes: ["235/40R18", "225/50R18"],
    recommendedCategory: "Passenger",
    popularModels: ["Hankook Ventus Prime 4", "Michelin Primacy 5", "Nexen N Fera SU4"]
  },
  {
    id: "honda-hrv-rv",
    make: "Honda",
    model: "HR-V (RV / RU)",
    yearRange: "2015 - 2026",
    oeSize: "215/60R17",
    upgradeSizes: ["225/50R18", "235/50R18"],
    recommendedCategory: "SUV / Crossover",
    popularModels: ["Goodyear AMG SUV", "Hankook K135", "Michelin Primacy 5"]
  },

  // MITSUBISHI & FORD
  {
    id: "mitsubishi-triton",
    make: "Mitsubishi",
    model: "Triton VGT",
    yearRange: "2016 - 2026",
    oeSize: "265/65R17",
    upgradeSizes: ["265/60R18"],
    recommendedCategory: "4x4 / Offroad",
    popularModels: ["Hankook Dynapro AT2", "Autogreen Grandtour AT22"]
  },
  {
    id: "ford-ranger",
    make: "Ford",
    model: "Ranger T6 / Next-Gen",
    yearRange: "2016 - 2026",
    oeSize: "265/65R17",
    upgradeSizes: ["265/60R18", "285/60R18"],
    recommendedCategory: "4x4 / Offroad",
    popularModels: ["Hankook Dynapro AT2", "Autogreen Grandtour AT22"]
  },

  // HYUNDAI
  {
    id: "hyundai-staria",
    make: "Hyundai",
    model: "Staria / Starex",
    yearRange: "2018 - 2026",
    oeSize: "215/65R17C",
    upgradeSizes: ["235/55R18"],
    recommendedCategory: "Commercial / Van",
    popularModels: ["Nexen Roadian CTX", "Goodyear Cargo Marathon"]
  }
];
