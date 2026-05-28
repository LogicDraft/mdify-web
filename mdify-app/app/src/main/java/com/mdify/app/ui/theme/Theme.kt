package com.mdify.app.ui.theme

import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.platform.LocalContext
import com.mdify.app.data.AppSettings
import com.mdify.app.data.ThemePreference

private val DarkColors = darkColorScheme(
    primary = Pine,
    onPrimary = DeepForest,
    primaryContainer = PineDark,
    onPrimaryContainer = Mist,
    secondary = Mint,
    tertiary = Aqua,
    background = DeepForest,
    surface = Slate,
    surfaceContainer = ColorTokens.darkContainer,
    surfaceContainerHigh = ColorTokens.darkContainerHigh,
    surfaceContainerHighest = ColorTokens.darkContainerHighest,
    onSurface = Mist,
    onSurfaceVariant = Ash
)

private val LightColors = lightColorScheme(
    primary = PineDark,
    onPrimary = Mist,
    primaryContainer = Mint,
    onPrimaryContainer = DeepForest,
    secondary = Pine,
    tertiary = Aqua,
    background = ColorTokens.lightBackground,
    surface = ColorTokens.lightSurface,
    surfaceContainer = ColorTokens.lightContainer,
    surfaceContainerHigh = ColorTokens.lightContainerHigh,
    surfaceContainerHighest = ColorTokens.lightContainerHighest,
    onSurface = ColorTokens.lightOnSurface,
    onSurfaceVariant = ColorTokens.lightOnSurfaceVariant
)

@Composable
fun MDifyTheme(
    appSettings: AppSettings = AppSettings(),
    dynamicColor: Boolean = true,
    content: @Composable () -> Unit
) {
    val isSystemDark = isSystemInDarkTheme()
    val darkTheme = when (appSettings.theme) {
        ThemePreference.SYSTEM -> isSystemDark
        ThemePreference.LIGHT -> false
        ThemePreference.DARK -> true
    }

    val colorScheme = when {
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            val context = LocalContext.current
            if (darkTheme) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
        }
        darkTheme -> DarkColors
        else -> LightColors
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = MdifyTypography,
        content = content
    )
}
