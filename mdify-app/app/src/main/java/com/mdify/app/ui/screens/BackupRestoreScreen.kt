package com.mdify.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.ArrowBack
import androidx.compose.material.icons.outlined.Build
import androidx.compose.material.icons.outlined.RestorePage
import androidx.compose.material.icons.outlined.Storage
import androidx.compose.material.icons.outlined.UploadFile
import androidx.compose.material3.CenterAlignedTopAppBar
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun BackupRestoreScreen(
    onBack: () -> Unit,
    onBackupSettings: () -> Unit,
    onBackupDatabase: () -> Unit,
    onBackupAll: () -> Unit,
    onRestore: () -> Unit
) {
    val colors = MaterialTheme.colorScheme

    Scaffold(
        containerColor = colors.background,
        topBar = {
            CenterAlignedTopAppBar(
                title = { Text(androidx.compose.ui.res.stringResource(com.mdify.app.R.string.backup_restore), fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Outlined.ArrowBack, contentDescription = "Back")
                    }
                },
                colors = TopAppBarDefaults.centerAlignedTopAppBarColors(containerColor = Color.Transparent)
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .verticalScroll(rememberScrollState())
        ) {
            Spacer(modifier = Modifier.height(16.dp))

            // Backup Section
            Text(
                text = androidx.compose.ui.res.stringResource(com.mdify.app.R.string.backup),
                style = MaterialTheme.typography.labelLarge,
                color = colors.primary,
                modifier = Modifier.padding(horizontal = 24.dp, vertical = 8.dp)
            )

            BackupRestoreCard(
                title = androidx.compose.ui.res.stringResource(com.mdify.app.R.string.backup_settings),
                subtitle = androidx.compose.ui.res.stringResource(com.mdify.app.R.string.backup_settings_desc),
                icon = Icons.Outlined.Build,
                onClick = onBackupSettings
            )
            
            BackupRestoreCard(
                title = androidx.compose.ui.res.stringResource(com.mdify.app.R.string.backup_database),
                subtitle = androidx.compose.ui.res.stringResource(com.mdify.app.R.string.backup_database_desc),
                icon = Icons.Outlined.Storage,
                onClick = onBackupDatabase
            )
            
            BackupRestoreCard(
                title = androidx.compose.ui.res.stringResource(com.mdify.app.R.string.backup_all),
                subtitle = androidx.compose.ui.res.stringResource(com.mdify.app.R.string.backup_all_desc),
                icon = Icons.Outlined.UploadFile,
                onClick = onBackupAll
            )

            Spacer(modifier = Modifier.height(24.dp))

            // Restore Section
            Text(
                text = androidx.compose.ui.res.stringResource(com.mdify.app.R.string.restore),
                style = MaterialTheme.typography.labelLarge,
                color = colors.primary,
                modifier = Modifier.padding(horizontal = 24.dp, vertical = 8.dp)
            )

            BackupRestoreCard(
                title = androidx.compose.ui.res.stringResource(com.mdify.app.R.string.restore_data),
                subtitle = androidx.compose.ui.res.stringResource(com.mdify.app.R.string.restore_data_desc),
                icon = Icons.Outlined.RestorePage,
                onClick = onRestore
            )
            
            Spacer(modifier = Modifier.height(32.dp))
        }
    }
}

@Composable
private fun BackupRestoreCard(
    title: String,
    subtitle: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    onClick: () -> Unit
) {
    val colors = MaterialTheme.colorScheme
    Surface(
        shape = RoundedCornerShape(16.dp),
        color = colors.surfaceContainer,
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 24.dp, vertical = 8.dp)
            .clickable(onClick = onClick)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(20.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                icon, 
                contentDescription = null, 
                tint = colors.primary, // Using primary color for icon to match the screenshot pink hue
                modifier = Modifier.padding(end = 16.dp)
            )
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = title, 
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = subtitle, 
                    style = MaterialTheme.typography.bodyMedium, 
                    color = colors.onSurfaceVariant
                )
            }
        }
    }
}
