package com.mdify.app.ui.screens

import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.ArrowOutward
import androidx.compose.material.icons.outlined.DeleteOutline
import androidx.compose.material.icons.outlined.Description
import androidx.compose.material.icons.outlined.PictureAsPdf
import androidx.compose.material.icons.outlined.Schedule
import androidx.compose.material.icons.outlined.UploadFile
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ElevatedButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.mdify.app.model.ConversionHistoryItem
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

@Composable
fun HomeScreen(
    history: List<ConversionHistoryItem>,
    onUploadClick: () -> Unit,
    onRecentSelected: (ConversionHistoryItem) -> Unit,
    onDeleteHistoryItem: (ConversionHistoryItem) -> Unit,
    onClearHistory: () -> Unit
) {
    val colors = MaterialTheme.colorScheme
    val transition = rememberInfiniteTransition(label = "bg")
    val drift = transition.animateFloat(
        initialValue = 0f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(
            animation = tween(6000, easing = LinearEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "drift"
    )

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(colors.background)
    ) {
        Canvas(modifier = Modifier.fillMaxSize()) {
            drawCircle(
                brush = Brush.radialGradient(
                    colors = listOf(colors.primary.copy(alpha = 0.24f), Color.Transparent),
                    center = Offset(size.width * 0.15f, size.height * (0.12f + drift.value * 0.08f)),
                    radius = size.minDimension * 0.55f
                ),
                radius = size.minDimension * 0.55f,
                center = Offset(size.width * 0.15f, size.height * (0.12f + drift.value * 0.08f))
            )
            drawCircle(
                brush = Brush.radialGradient(
                    colors = listOf(colors.tertiary.copy(alpha = 0.14f), Color.Transparent),
                    center = Offset(size.width * 0.85f, size.height * 0.28f),
                    radius = size.minDimension * 0.4f
                ),
                radius = size.minDimension * 0.4f,
                center = Offset(size.width * 0.85f, size.height * 0.28f)
            )
        }

        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 20.dp, vertical = 28.dp)
                .verticalScroll(rememberScrollState())
        ) {
            Text(
                text = "MDify",
                style = MaterialTheme.typography.headlineLarge,
                fontWeight = FontWeight.ExtraBold
            )
            Text(
                text = "Clean DOCX and PDF files into markdown built for notes, docs, and AI workflows.",
                style = MaterialTheme.typography.bodyLarge,
                color = colors.onSurfaceVariant,
                modifier = Modifier.padding(top = 8.dp)
            )

            Spacer(modifier = Modifier.height(24.dp))

            Surface(
                shape = RoundedCornerShape(28.dp),
                color = colors.surfaceContainerHigh,
                tonalElevation = 8.dp,
                shadowElevation = 12.dp,
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(22.dp)) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(42.dp)
                                .clip(RoundedCornerShape(14.dp))
                                .background(
                                    Brush.linearGradient(
                                        listOf(colors.primary, colors.tertiary)
                                    )
                                ),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Outlined.UploadFile,
                                contentDescription = null,
                                tint = colors.onPrimary
                            )
                        }
                        Column {
                            Text("Upload a document", style = MaterialTheme.typography.titleLarge)
                            Text(
                                "Local conversion. No cloud dependency.",
                                style = MaterialTheme.typography.bodyMedium,
                                color = colors.onSurfaceVariant
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(18.dp))

                    ElevatedButton(
                        onClick = onUploadClick,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Icon(Icons.Outlined.UploadFile, contentDescription = null)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Choose DOCX or PDF")
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    Row(
                        modifier = Modifier.horizontalScroll(rememberScrollState()),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        FormatChip("DOCX", colors.primary)
                        FormatChip("PDF", Color(0xFFE57373))
                        FormatChip("Markdown Preview", colors.tertiary)
                        FormatChip("Offline Ready", colors.secondary)
                    }
                }
            }

            Spacer(modifier = Modifier.height(22.dp))

            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                FeatureCard("Live preview", "Edit and render markdown side by side.", Modifier.weight(1f))
                FeatureCard("Export .md", "Copy, share, or save clean markdown.", Modifier.weight(1f))
            }

            Spacer(modifier = Modifier.height(12.dp))

            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                FeatureCard("Recent files", "Jump back into your last conversions instantly.", Modifier.weight(1f))
                FeatureCard("Developer polish", "Green accents, deep dark mode, calm motion.", Modifier.weight(1f))
            }

            Spacer(modifier = Modifier.height(28.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Recent files",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.SemiBold
                )
                Spacer(modifier = Modifier.weight(1f))
                if (history.isNotEmpty()) {
                    Text(
                        text = "Clear",
                        style = MaterialTheme.typography.labelLarge,
                        color = colors.primary,
                        modifier = Modifier.clickable(onClick = onClearHistory)
                    )
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            if (history.isEmpty()) {
                Surface(
                    shape = RoundedCornerShape(24.dp),
                    color = colors.surfaceContainer,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(
                        modifier = Modifier.padding(20.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Text("No recent conversions yet", style = MaterialTheme.typography.titleMedium)
                        Text(
                            "Your latest markdown exports will show up here for quick reopening.",
                            style = MaterialTheme.typography.bodyMedium,
                            color = colors.onSurfaceVariant
                        )
                    }
                }
            } else {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    history.forEach { item ->
                        RecentCard(
                            item = item,
                            onOpen = { onRecentSelected(item) },
                            onDelete = { onDeleteHistoryItem(item) }
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun FormatChip(label: String, accent: Color) {
    Surface(
        shape = RoundedCornerShape(100.dp),
        color = accent.copy(alpha = 0.12f)
    ) {
        Text(
            text = label,
            modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp),
            color = accent,
            style = MaterialTheme.typography.labelLarge
        )
    }
}

@Composable
private fun FeatureCard(title: String, description: String, modifier: Modifier = Modifier) {
    Card(
        modifier = modifier,
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceContainer),
        shape = RoundedCornerShape(24.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(title, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold)
            Spacer(modifier = Modifier.height(6.dp))
            Text(description, style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
    }
}

@Composable
private fun RecentCard(
    item: ConversionHistoryItem,
    onOpen: () -> Unit,
    onDelete: () -> Unit
) {
    val colors = MaterialTheme.colorScheme
    Surface(
        onClick = onOpen,
        shape = RoundedCornerShape(24.dp),
        color = colors.surfaceContainerHigh,
        tonalElevation = 6.dp,
        shadowElevation = 10.dp
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(46.dp)
                    .clip(RoundedCornerShape(16.dp))
                    .background(
                        if (item.fileType == "pdf") Color(0x22FF6B6B) else Color(0x223CCF91)
                    ),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = if (item.fileType == "pdf") Icons.Outlined.PictureAsPdf else Icons.Outlined.Description,
                    contentDescription = null,
                    tint = if (item.fileType == "pdf") Color(0xFFFF8A80) else colors.primary
                )
            }

            Spacer(modifier = Modifier.width(12.dp))

            Column(modifier = Modifier.weight(1f)) {
                Text(item.fileName, style = MaterialTheme.typography.titleMedium, maxLines = 1)
                Spacer(modifier = Modifier.height(4.dp))
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Outlined.Schedule, contentDescription = null, tint = colors.onSurfaceVariant, modifier = Modifier.size(14.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        formatDate(item.convertedAt),
                        style = MaterialTheme.typography.bodySmall,
                        color = colors.onSurfaceVariant
                    )
                }
                Spacer(modifier = Modifier.height(6.dp))
                Text(
                    item.markdown.take(90).replace('\n', ' '),
                    style = MaterialTheme.typography.bodySmall,
                    color = colors.onSurfaceVariant,
                    maxLines = 2
                )
            }

            Icon(Icons.Outlined.ArrowOutward, contentDescription = null, tint = colors.primary)
            IconButton(onClick = onDelete) {
                Icon(Icons.Outlined.DeleteOutline, contentDescription = "Delete recent file")
            }
        }
    }
}

private fun formatDate(time: Long): String =
    SimpleDateFormat("dd MMM · hh:mm a", Locale.getDefault()).format(Date(time))
