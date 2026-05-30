const winston = require('winston');
const path = require('path');

// Definicion de los niveles de log soportados por la aplicacion
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};

// Mapeo de colores asociados a cada nivel para mayor legibilidad en consola
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white',
};

// Vincular los colores configurados al modulo de winston
winston.addColors(colors);

// Formato de impresion de logs: incluye timestamp, colores y estructura del mensaje
const format = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.colorize({ all: true }),
    winston.format.printf(
        (info) => `${info.timestamp} ${info.level}: ${info.message}`,
    ),
);

// Transportes: define el destino físico donde se guardaran o veran los logs
const transports = [
    // Mostrar logs por consola estandar
    new winston.transports.Console(),
    // Registrar errores graves en logs/error.log
    new winston.transports.File({
        filename: path.join(__dirname, '../logs/error.log'),
        level: 'error',
    }),
    // Registrar todos los logs generales en logs/all.log
    new winston.transports.File({
        filename: path.join(__dirname, '../logs/all.log'),
    }),
];

// Crear la instancia del logger con configuracion de nivel dinamico segun el entorno
const logger = winston.createLogger({
    // En desarrollo se muestran todos los logs (hasta debug), en produccion solo de info para arriba
    level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
    levels,
    format,
    transports,
});

module.exports = logger;
