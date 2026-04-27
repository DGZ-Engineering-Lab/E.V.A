/**
 * E.V.A. PRO — Configuration & Constant Repository
 * DGZ Engineering Lab © 2026
 */

const EVA_CONFIG = {
    VERSION: "3.3.1",
    IPC_TABLE_DANE: {
        2010: 67.24,  2011: 69.75,  2012: 71.45,  2013: 72.84,  2014: 75.51,
        2015: 80.62,  2016: 85.25,  2017: 88.74,  2018: 100.00, 2019: 103.80,
        2020: 105.47, 2021: 111.40, 2022: 126.02, 2023: 137.71, 2024: 147.05, 2025: 152.26
    },
    BIO_LIMITS: {
        ab: { min: 3, max: 300, warnMin: 5, warnMax: 200 },
        alt: { min: 0.5, max: 60, warnMin: 1, warnMax: 45 }
    },
    FACTOR_ZENITH_DEFAULT: 1.5226
};

// Compatibility export
const IPC_TABLE_DANE = EVA_CONFIG.IPC_TABLE_DANE;
const BIO_LIMITS = EVA_CONFIG.BIO_LIMITS;
