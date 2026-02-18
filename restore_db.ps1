# ==============================================================================
# SCRIPT DE RESTAURACION POWERSHELL - CGR SEGURA (MariaDB Docker)
# ==============================================================================

# 1. Configuracion
$BackupPath = "./backups"
$ContainerName = "cgr-lms-mariadb"

# 2. Cargar variables desde .env si existe
# 2. Cargar variables desde .env
$DbName = $null
$DbUser = $null
$DbPass = $null

if (Test-Path ".env") {
    Get-Content ".env" | Where-Object { $_ -match "^[^#].+=.+" } | ForEach-Object {
        $key, $value = $_.Split('=', 2)
        if ($key -eq "DB_NAME") { $DbName = $value.Trim() }
        if ($key -eq "DB_USER") { $DbUser = $value.Trim() }
        if ($key -eq "DB_PASSWORD") { $DbPass = $value.Trim() }
    }
}

if ([string]::IsNullOrWhiteSpace($DbName) -or [string]::IsNullOrWhiteSpace($DbUser) -or [string]::IsNullOrWhiteSpace($DbPass)) {
    Write-Host "ERROR: Faltan variables de base de datos en el archivo .env (DB_NAME, DB_USER, DB_PASSWORD)"
    exit
}

Write-Host "------------------------------------------------------------"
Write-Host "Iniciando proceso de restauracion..."

# 3. Buscar el respaldo mas reciente (.sql)
$LatestBackup = Get-ChildItem -Path $BackupPath -Filter "respaldo_${DbName}_*.sql" | 
Sort-Object LastWriteTime -Descending | 
Select-Object -First 1

if ($null -eq $LatestBackup) {
    Write-Host "ERROR: No se encontro ningun archivo de respaldo en $BackupPath"
    Write-Host "------------------------------------------------------------"
    exit
}

Write-Host "Archivo detectado: $($LatestBackup.FullName)"

# 4. Restaurar el archivo
try {
    # Usamos Get-Content y lo pasamos por el pipeline al comando docker
    Get-Content $LatestBackup.FullName | docker exec -i $ContainerName mariadb -u $DbUser -p$DbPass $DbName
    
    Write-Host "Restauracion completada exitosamente."
}
catch {
    Write-Host "ERROR: Ocurrio un problema durante la restauracion."
}

Write-Host "------------------------------------------------------------"
