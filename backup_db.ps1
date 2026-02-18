# ==============================================================================
# SCRIPT DE RESPALDO POWERSHELL - CGR SEGURA (MariaDB Docker)
# ==============================================================================

# 1. Configuracion
$BackupPath = "./backups"
$ContainerName = "cgr-lms-mariadb"
$MaxBackups = 30

# Crear carpeta de respaldos si no existe
if (!(Test-Path $BackupPath)) {
    New-Item -ItemType Directory -Path $BackupPath
}

# 2. Cargar variables desde .env
$DbName = "cgr_lms"
$DbUser = "root"
$DbPass = $null

if (Test-Path ".env") {
    Get-Content ".env" | Where-Object { $_ -match "^[^#].+=.+" } | ForEach-Object {
        $key, $value = $_.Split('=', 2)
        if ($key -eq "DB_NAME") { $DbName = $value.Trim() }
        if ($key -eq "MYSQL_ROOT_PASSWORD") { $DbPass = $value.Trim() }
    }
}

if ([string]::IsNullOrWhiteSpace($DbName) -or [string]::IsNullOrWhiteSpace($DbPass)) {
    Write-Host "ERROR: Faltan variables de base de datos en el archivo .env (DB_NAME, MYSQL_ROOT_PASSWORD)"
    exit
}

$Timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$FileName = "respaldo_${DbName}_${Timestamp}.sql"
$FullBackupPath = Join-Path $BackupPath $FileName

Write-Host "------------------------------------------------------------"
Write-Host "Iniciando respaldo de base de datos: $DbName"

# 3. Ejecutar mariadb-dump dentro del contenedor
# Nota: Redireccionamos la salida a un archivo con encoding UTF8
try {
    docker exec $ContainerName mariadb-dump -h 127.0.0.1 -u "$DbUser" "-p$DbPass" "$DbName" | Out-File -FilePath $FullBackupPath -Encoding utf8
    
    if (Test-Path $FullBackupPath) {
        Write-Host "Respaldo completado exitosamente: $FullBackupPath"
        
        # 4. Limpieza de respaldos antiguos
        Write-Host "Limpiando respaldos antiguos (manteniendo ultimos $MaxBackups)..."
        $OldBackups = Get-ChildItem -Path $BackupPath -Filter "respaldo_${DbName}_*.sql" | 
        Sort-Object LastWriteTime -Descending | 
        Select-Object -Skip $MaxBackups
        
        if ($OldBackups) {
            $OldBackups | Remove-Item -Force
            Write-Host "Se eliminaron $($OldBackups.Count) respaldos antiguos"
        }
    }
}
catch {
    Write-Host "ERROR: No se pudo realizar el respaldo de la base de datos."
}

Write-Host "Proceso finalizado."
Write-Host "------------------------------------------------------------"
