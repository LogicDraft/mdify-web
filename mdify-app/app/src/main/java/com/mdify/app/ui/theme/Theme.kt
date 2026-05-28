package com.mdify.app.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable

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
fun MDifyTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = if (isSystemInDarkTheme()) DarkColors else LightColors,
        typography = MdifyTypography,
        content = content
    )
}
