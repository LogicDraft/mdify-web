package com.mdify.app.ui.screens

import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.AutoAwesome
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp

@Composable
fun ProcessingScreen(
    fileName: String,
    status: String,
    progress: Float
) {
    val colors = MaterialTheme.colorScheme
    val transition = rememberInfiniteTransition(label = "processing")
    val pulse = transition.animateFloat(
        initialValue = 0.75f,
        targetValue = 1.05f,
        animationSpec = infiniteRepeatable(
            animation = tween(1100, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "pulse"
    )

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(colors.background),
        contentAlignment = Alignment.Center
    ) {
        Canvas(modifier = Modifier.fillMaxSize()) {
            drawCircle(
                brush = Brush.radialGradient(
                    listOf(colors.primary.copy(alpha = 0.22f), Color.Transparent),
                    center = center,
                    radius = size.minDimension * pulse.value * 0.42f
                ),
                radius = size.minDimension * pulse.value * 0.42f,
                center = center
            )
        }

        Surface(
            shape = RoundedCornerShape(32.dp),
            color = colors.surfaceContainerHigh,
            tonalElevation = 10.dp,
            shadowElevation = 16.dp,
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 24.dp)
        ) {
            Column(
                modifier = Modifier.padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center
            ) {
                Box(
                    modifier = Modifier
                        .size(88.dp)
                        .background(
                            brush = Brush.linearGradient(
                                listOf(colors.primary, colors.tertiary)
                            ),
                            shape = RoundedCornerShape(28.dp)
                        ),
                    contentAlignment = Alignment.Center
                ) {
                    androidx.compose.material3.Icon(
                        imageVector = Icons.Outlined.AutoAwesome,
                        contentDescription = null,
                        tint = colors.onPrimary,
                        modifier = Modifier.size(34.dp)
                    )
                }

                Spacer(modifier = Modifier.height(20.dp))
                Text(androidx.compose.ui.res.stringResource(com.mdify.app.R.string.processing_document), style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
                Spacer(modifier = Modifier.height(8.dp))
                Text(fileName, style = MaterialTheme.typography.bodyLarge, color = colors.onSurfaceVariant)
                Spacer(modifier = Modifier.height(6.dp))
                Text(status, style = MaterialTheme.typography.bodyMedium, color = colors.primary)
                Spacer(modifier = Modifier.height(24.dp))
                LinearProgressIndicator(
                    progress = { progress.coerceIn(0f, 1f) },
                    modifier = Modifier.fillMaxWidth().height(8.dp),
                    trackColor = colors.surfaceContainerHighest,
                    color = colors.primary
                )
                Spacer(modifier = Modifier.height(10.dp))
                Text("${(progress * 100).toInt()}%", style = MaterialTheme.typography.labelLarge, color = colors.onSurfaceVariant)
            }
        }
    }
}
