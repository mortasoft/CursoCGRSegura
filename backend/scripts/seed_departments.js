const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const db = require('../config/database');

const departments = [
    'Área de Fiscalización para el Desarrollo de Capacidades (CAP)',
    'Área de Fiscalización para el Desarrollo de la Gobernanza (GOB)',
    'Área de Fiscalización para el Desarrollo de las Ciudades (CIU)',
    'Área de Fiscalización para el Desarrollo de las Finanzas Públicas (FIP)',
    'Área de Fiscalización para el Desarrollo del Bienestar Social (BIS)',
    'Área de Fiscalización para el Desarrollo Local (LOC)',
    'Área de Fiscalización para el Desarrollo Sostenible (SOS)',
    'Área de Investigación para la Denuncia Ciudadana (DEC)',
    'Área de Seguimiento para la Mejora Pública (SEM)',
    'Área para la Innovación y Aprendizaje en la Fiscalización (IAF)',
    'Auditoría Interna (AIG)',
    'Despacho Contralor (DC)',
    'División de Contratacion Publica (DCP)',
    'División de Fiscalización Operativa y Evaluativa (DFOE)',
    'División de Gestión de Apoyo (DGA)',
    'Division Juridica (DJ)',
    'Unidad Centro de Capacitación (UCC)',
    'Unidad de Administración Financiera (UAF)',
    'Unidad de Gestión del Potencial Humano (UGPH)',
    'Unidad de Gobierno Corporativo (UGC)',
    'Unidad de Prensa (UPC)',
    'Unidad de Servicios de Información (USI)',
    'Unidad de Servicios de Proveeduría (USP)',
    'Unidad de Servicios Generales (USG)',
    'Unidad de Tecnologías de Información (UTI)',
    'Unidad Jurídica Interna (UJI)'
];

const seedDepartments = async () => {
    console.log('🌱 Iniciando carga de departamentos...');
    console.log(`📋 Total a procesar: ${departments.length}`);

    try {
        let inserted = 0;
        for (const dept of departments) {
            const result = await db.query('INSERT IGNORE INTO departments (name) VALUES (?)', [dept]);
            if (result.affectedRows > 0) {
                inserted++;
            }
        }
        console.log(`✅ Proceso completado.`);
        console.log(`   - Nuevos insertados: ${inserted}`);
        console.log(`   - Total procesados: ${departments.length}`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Error al insertar departamentos:', error);
        process.exit(1);
    }
};

// Esperar un momento para asegurar que la conexión a DB se establezca (aunque db query maneja pool)
setTimeout(seedDepartments, 1000);
