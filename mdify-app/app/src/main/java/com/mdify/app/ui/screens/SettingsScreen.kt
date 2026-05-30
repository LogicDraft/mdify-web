package com.mdify.app.ui.screens

import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import android.content.Intent
import android.provider.Settings
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.systemBarsPadding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.ArrowBack
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.outlined.ColorLens
import androidx.compose.material.icons.outlined.Info
import androidx.compose.material.icons.outlined.Notifications
import androidx.compose.material.icons.outlined.Delete
import androidx.compose.material.icons.outlined.AutoAwesome
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.platform.LocalContext
import com.mdify.app.R
import com.mdify.app.data.AppSettings

@Composable
fun SettingsScreen(
    settings: AppSettings,
    onBack: () -> Unit,
    onNotificationsChange: (Boolean) -> Unit,
    onAppResetClick: () -> Unit,
    onLookAndFeelClick: () -> Unit,
    onAboutClick: () -> Unit
) {
    var showResetDialog by androidx.compose.runtime.remember { androidx.compose.runtime.mutableStateOf(false) }
    val colors = MaterialTheme.colorScheme
    val context = LocalContext.current

    val infiniteTransition = rememberInfiniteTransition(label = "gear_rotation")
    val rotation by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 360f,
        animationSpec = infiniteRepeatable(
            animation = tween(4000, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "gear_rotation_anim"
    )

    androidx.compose.material3.Scaffold(
        containerColor = colors.background,
        topBar = {
            androidx.compose.material3.CenterAlignedTopAppBar(
                title = { Text(stringResource(R.string.settings), fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Outlined.ArrowBack, contentDescription = "Back")
                    }
                },
                colors = androidx.compose.material3.TopAppBarDefaults.centerAlignedTopAppBarColors(containerColor = androidx.compose.ui.graphics.Color.Transparent)
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .verticalScroll(rememberScrollState()),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Spacer(modifier = Modifier.height(16.dp))
            
            // Animated Gears
            Box(
                modifier = Modifier.size(120.dp),
                contentAlignment = Alignment.Center
            ) {
                // Large bottom gear
                Icon(
                    imageVector = Icons.Filled.Settings,
                    contentDescription = null,
                    modifier = Modifier
                        .size(64.dp)
                        .align(Alignment.BottomCenter)
                        .offset(x = (-12).dp, y = (-4).dp)
                        .rotate(rotation),
                    tint = colors.primaryContainer
                )
                // Medium top gear
                Icon(
                    imageVector = Icons.Filled.Settings,
                    contentDescription = null,
                    modifier = Modifier
                        .size(48.dp)
                        .align(Alignment.TopEnd)
                        .offset(x = (-16).dp, y = 12.dp)
                        .rotate(-rotation * 1.5f),
                    tint = colors.primaryContainer
                )
                // Small side gear
                Icon(
                    imageVector = Icons.Filled.Settings,
                    contentDescription = null,
                    modifier = Modifier
                        .size(32.dp)
                        .align(Alignment.CenterEnd)
                        .offset(x = (-8).dp, y = 20.dp)
                        .rotate(rotation * 2f),
                    tint = colors.primaryContainer
                )
            }
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Text(
                text = stringResource(R.string.tweak_experience),
                style = MaterialTheme.typography.titleMedium,
                color = colors.primary
            )
            
            Spacer(modifier = Modifier.height(32.dp))

            // Settings Cards
            SettingsCard(
                title = stringResource(R.string.look_and_feel),
                subtitle = stringResource(R.string.look_and_feel_subtitle),
                icon = Icons.Outlined.ColorLens,
                onClick = onLookAndFeelClick
            )

            SettingsCard(
                title = stringResource(R.string.notifications),
                subtitle = stringResource(R.string.notifications_subtitle),
                icon = Icons.Outlined.Notifications,
                onClick = {
                    val intent = Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS).apply {
                        putExtra(Settings.EXTRA_APP_PACKAGE, context.packageName)
                    }
                    context.startActivity(intent)
                }
            )

            val usageCount = if (settings.aiUsageDate == java.time.LocalDate.now().toString()) settings.aiUsageCount else 0
            SettingsCard(
                title = stringResource(R.string.ai_integration),
                subtitle = "${stringResource(R.string.daily_ai_usage)}: $usageCount / 3",
                icon = Icons.Outlined.AutoAwesome,
                onClick = { /* No action needed or maybe open an AI settings screen */ }
            )

            SettingsCard(
                title = stringResource(R.string.app_reset),
                subtitle = stringResource(R.string.app_reset_desc),
                icon = Icons.Outlined.Delete,
                onClick = { showResetDialog = true }
            )

            SettingsCard(
                title = stringResource(R.string.about),
                subtitle = stringResource(R.string.about_subtitle),
                icon = Icons.Outlined.Info,
                onClick = onAboutClick
            )

            Spacer(modifier = Modifier.height(48.dp))
        }
    if (showResetDialog) {
        androidx.compose.material3.AlertDialog(
            onDismissRequest = { showResetDialog = false },
            title = { Text(stringResource(R.string.app_reset)) },
            text = { Text(stringResource(R.string.app_reset_confirm)) },
            confirmButton = {
                androidx.compose.material3.TextButton(
                    onClick = {
                        showResetDialog = false
                        onAppResetClick()
                    }
                ) {
                    Text(stringResource(R.string.reset))
                }
            },
            dismissButton = {
                androidx.compose.material3.TextButton(onClick = { showResetDialog = false }) {
                    Text(stringResource(R.string.cancel))
                }
            }
        )
    }
}

@Composable
private fun SettingsCard(
    title: String,
    subtitle: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    onClick: () -> Unit
) {
    Surface(
        shape = RoundedCornerShape(24.dp),
        color = MaterialTheme.colorScheme.surfaceContainer,
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 24.dp, vertical = 6.dp)
            .clickable(onClick = onClick)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 24.dp, vertical = 20.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.primary,
                modifier = Modifier.padding(end = 20.dp)
            )
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = title,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = subtitle,
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
    }
}
