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
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.ArrowBack
import androidx.compose.material.icons.outlined.DarkMode
import androidx.compose.material.icons.outlined.Info
import androidx.compose.material.icons.outlined.Notifications
import androidx.compose.material.icons.outlined.Policy
import androidx.compose.material3.CenterAlignedTopAppBar
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.mdify.app.data.AppSettings
import com.mdify.app.data.ThemePreference

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsScreen(
    settings: AppSettings,
    onBack: () -> Unit,
    onThemeChange: (ThemePreference) -> Unit,
    onNotificationsChange: (Boolean) -> Unit,
    onGeminiApiKeyChange: (String) -> Unit,
    onPrivacyPolicyClick: () -> Unit
) {
    val colors = MaterialTheme.colorScheme

    Scaffold(
        containerColor = colors.background,
        topBar = {
            CenterAlignedTopAppBar(
                title = { Text("Settings", fontWeight = FontWeight.Bold) },
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
            
            // Appearance Section
            SettingsSectionHeader("Appearance")
            ThemeSelectionRow(
                currentTheme = settings.theme,
                onThemeSelected = onThemeChange
            )
            
            HorizontalDivider(modifier = Modifier.padding(vertical = 16.dp), color = colors.surfaceVariant.copy(alpha = 0.5f))
            
            // Preferences Section
            SettingsSectionHeader("Preferences")
            SettingsSwitchRow(
                title = "Notifications",
                subtitle = "Alert when a conversion completes",
                icon = Icons.Outlined.Notifications,
                checked = settings.notificationsEnabled,
                onCheckedChange = onNotificationsChange
            )
            
            HorizontalDivider(modifier = Modifier.padding(vertical = 16.dp), color = colors.surfaceVariant.copy(alpha = 0.5f))

            // AI Integration Section
            SettingsSectionHeader("AI Integration")
            Column(modifier = Modifier.fillMaxWidth().padding(horizontal = 24.dp, vertical = 8.dp)) {
                Text(
                    "Daily AI Usage: ${if (settings.aiUsageDate == java.time.LocalDate.now().toString()) settings.aiUsageCount else 0} / 3",
                    style = MaterialTheme.typography.bodyMedium,
                    color = colors.onSurfaceVariant
                )
                Spacer(modifier = Modifier.height(8.dp))
                androidx.compose.material3.OutlinedTextField(
                    value = settings.geminiApiKey,
                    onValueChange = onGeminiApiKeyChange,
                    label = { Text("Gemini API Key") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                    placeholder = { Text("AIza...") }
                )
            }
            
            HorizontalDivider(modifier = Modifier.padding(vertical = 16.dp), color = colors.surfaceVariant.copy(alpha = 0.5f))
            
            // About Section
            SettingsSectionHeader("About")
            SettingsActionRow(
                title = "Privacy Policy",
                subtitle = "Read how we handle your data",
                icon = Icons.Outlined.Policy,
                onClick = onPrivacyPolicyClick
            )
            SettingsActionRow(
                title = "Version 1.0",
                subtitle = "Built for seamless Markdown conversion",
                icon = Icons.Outlined.Info,
                onClick = {}
            )
        }
    }
}

@Composable
private fun SettingsSectionHeader(title: String) {
    Text(
        text = title,
        style = MaterialTheme.typography.labelLarge,
        color = MaterialTheme.colorScheme.primary,
        modifier = Modifier.padding(horizontal = 24.dp, vertical = 8.dp)
    )
}

@Composable
private fun ThemeSelectionRow(currentTheme: ThemePreference, onThemeSelected: (ThemePreference) -> Unit) {
    val colors = MaterialTheme.colorScheme
    Column(modifier = Modifier.fillMaxWidth().padding(horizontal = 24.dp, vertical = 8.dp)) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(Icons.Outlined.DarkMode, contentDescription = null, tint = colors.onSurfaceVariant)
            Spacer(modifier = Modifier.width(16.dp))
            Text("Theme", style = MaterialTheme.typography.titleMedium)
        }
        Spacer(modifier = Modifier.height(12.dp))
        Row(modifier = Modifier.fillMaxWidth()) {
            ThemePreference.values().forEach { theme ->
                val selected = theme == currentTheme
                val backgroundColor = if (selected) colors.primaryContainer else Color.Transparent
                val textColor = if (selected) colors.onPrimaryContainer else colors.onSurfaceVariant
                
                Text(
                    text = theme.name.lowercase().capitalize(),
                    color = textColor,
                    style = MaterialTheme.typography.labelLarge,
                    modifier = Modifier
                        .weight(1f)
                        .background(backgroundColor, shape = androidx.compose.foundation.shape.RoundedCornerShape(16.dp))
                        .clickable { onThemeSelected(theme) }
                        .padding(vertical = 12.dp),
                    textAlign = androidx.compose.ui.text.style.TextAlign.Center
                )
            }
        }
    }
}

@Composable
private fun SettingsSwitchRow(
    title: String,
    subtitle: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    checked: Boolean,
    onCheckedChange: (Boolean) -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onCheckedChange(!checked) }
            .padding(horizontal = 24.dp, vertical = 16.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Icon(icon, contentDescription = null, tint = MaterialTheme.colorScheme.onSurfaceVariant)
        Spacer(modifier = Modifier.width(16.dp))
        Column(modifier = Modifier.weight(1f)) {
            Text(title, style = MaterialTheme.typography.titleMedium)
            Text(subtitle, style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
        Switch(checked = checked, onCheckedChange = onCheckedChange)
    }
}

@Composable
private fun SettingsActionRow(
    title: String,
    subtitle: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    onClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
            .padding(horizontal = 24.dp, vertical = 16.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Icon(icon, contentDescription = null, tint = MaterialTheme.colorScheme.onSurfaceVariant)
        Spacer(modifier = Modifier.width(16.dp))
        Column(modifier = Modifier.weight(1f)) {
            Text(title, style = MaterialTheme.typography.titleMedium)
            Text(subtitle, style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
    }
}
