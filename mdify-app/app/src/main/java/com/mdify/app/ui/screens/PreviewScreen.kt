package com.mdify.app.ui.screens

import android.webkit.WebView
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.weight
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.ArrowBack
import androidx.compose.material.icons.outlined.ContentCopy
import androidx.compose.material.icons.outlined.Download
import androidx.compose.material.icons.outlined.EditNote
import androidx.compose.material.icons.outlined.IosShare
import androidx.compose.material.icons.outlined.Preview
import androidx.compose.material.icons.outlined.Splitscreen
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import com.mdify.app.model.ConversionResult
import com.mdify.app.model.PreviewMode
import org.commonmark.ext.gfm.tables.TablesExtension
import org.commonmark.parser.Parser
import org.commonmark.renderer.html.HtmlRenderer

@Composable
fun PreviewScreen(
    result: ConversionResult,
    previewMode: PreviewMode,
    onBack: () -> Unit,
    onMarkdownChange: (String) -> Unit,
    onModeChange: (PreviewMode) -> Unit,
    onCopy: () -> Unit,
    onShare: () -> Unit,
    onExport: () -> Unit
) {
    val colors = MaterialTheme.colorScheme
    val wideScreen = LocalConfiguration.current.screenWidthDp >= 900
    val effectiveMode = if (!wideScreen && previewMode == PreviewMode.Split) PreviewMode.Editor else previewMode

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(colors.background)
            .padding(top = 20.dp, start = 16.dp, end = 16.dp, bottom = 12.dp)
    ) {
        Surface(
            shape = RoundedCornerShape(24.dp),
            color = colors.surfaceContainerHigh,
            tonalElevation = 8.dp,
            shadowElevation = 12.dp,
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Outlined.ArrowBack, contentDescription = "Back")
                    }
                    Column(modifier = Modifier.weight(1f)) {
                        Text(result.fileName, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold, maxLines = 1)
                        Text(
                            "${result.fileType.uppercase()} · ${result.conversionTimeMs}ms" + (result.pageCount?.let { " · $it pages" } ?: ""),
                            style = MaterialTheme.typography.bodyMedium,
                            color = colors.onSurfaceVariant
                        )
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    ModeChip("Split", previewMode == PreviewMode.Split, { onModeChange(PreviewMode.Split) }, Icons.Outlined.Splitscreen, enabled = wideScreen)
                    ModeChip("Edit", previewMode == PreviewMode.Editor || !wideScreen, { onModeChange(PreviewMode.Editor) }, Icons.Outlined.EditNote)
                    ModeChip("Preview", previewMode == PreviewMode.Preview, { onModeChange(PreviewMode.Preview) }, Icons.Outlined.Preview)
                }

                Spacer(modifier = Modifier.height(14.dp))

                Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    ActionButton("Copy", Icons.Outlined.ContentCopy, onCopy)
                    ActionButton("Share", Icons.Outlined.IosShare, onShare)
                    ActionButton("Export", Icons.Outlined.Download, onExport)
                }
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        when (effectiveMode) {
            PreviewMode.Split -> Row(
                modifier = Modifier.fillMaxSize(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                EditorPane(result.markdown, onMarkdownChange, Modifier.weight(1f))
                PreviewPane(result.markdown, Modifier.weight(1f))
            }

            PreviewMode.Editor -> EditorPane(result.markdown, onMarkdownChange, Modifier.fillMaxSize())
            PreviewMode.Preview -> PreviewPane(result.markdown, Modifier.fillMaxSize())
        }
    }
}

@Composable
private fun ModeChip(
    label: String,
    selected: Boolean,
    onClick: () -> Unit,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    enabled: Boolean = true
) {
    Surface(
        onClick = onClick,
        enabled = enabled,
        shape = RoundedCornerShape(16.dp),
        color = if (selected) MaterialTheme.colorScheme.primaryContainer else MaterialTheme.colorScheme.surfaceContainer
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 12.dp, vertical = 10.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(icon, contentDescription = null, tint = if (selected) MaterialTheme.colorScheme.onPrimaryContainer else MaterialTheme.colorScheme.onSurfaceVariant)
            Spacer(modifier = Modifier.width(8.dp))
            Text(label, color = if (selected) MaterialTheme.colorScheme.onPrimaryContainer else MaterialTheme.colorScheme.onSurfaceVariant)
        }
    }
}

@Composable
private fun ActionButton(
    label: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    onClick: () -> Unit
) {
    Surface(
        onClick = onClick,
        shape = RoundedCornerShape(18.dp),
        color = MaterialTheme.colorScheme.surfaceContainer,
        tonalElevation = 2.dp
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 14.dp, vertical = 10.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(icon, contentDescription = null)
            Spacer(modifier = Modifier.width(8.dp))
            Text(label)
        }
    }
}

@Composable
private fun EditorPane(markdown: String, onMarkdownChange: (String) -> Unit, modifier: Modifier = Modifier) {
    Surface(
        modifier = modifier,
        shape = RoundedCornerShape(24.dp),
        color = MaterialTheme.colorScheme.surfaceContainerHigh,
        tonalElevation = 8.dp
    ) {
        BasicTextField(
            value = markdown,
            onValueChange = onMarkdownChange,
            textStyle = MaterialTheme.typography.bodyMedium.copy(
                color = MaterialTheme.colorScheme.onSurface,
                fontFamily = FontFamily.Monospace
            ),
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(18.dp),
            decorationBox = { inner ->
                if (markdown.isBlank()) {
                    Text(
                        "Markdown appears here. Edit headings, lists, and notes before exporting.",
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                inner()
            }
        )
    }
}

@Composable
private fun PreviewPane(markdown: String, modifier: Modifier = Modifier) {
    Surface(
        modifier = modifier,
        shape = RoundedCornerShape(24.dp),
        color = MaterialTheme.colorScheme.surfaceContainerHigh,
        tonalElevation = 8.dp
    ) {
        val parser = Parser.builder().extensions(listOf(TablesExtension.create())).build()
        val renderer = HtmlRenderer.builder().extensions(listOf(TablesExtension.create())).build()
        val html = renderer.render(parser.parse(markdown))
        val css = """
            <style>
                body { background:#101513; color:#e7f0eb; font-family:sans-serif; padding:20px; line-height:1.6; }
                h1,h2,h3 { color:#9ef0be; }
                pre, code { background:#17211d; border-radius:12px; }
                pre { padding:16px; overflow:auto; }
                code { padding:2px 6px; }
                table { width:100%; border-collapse:collapse; margin:16px 0; }
                td, th { border:1px solid #294033; padding:10px; }
                blockquote { border-left:4px solid #3ccf91; padding-left:12px; color:#aac5b5; }
                a { color:#89d6ff; }
            </style>
        """.trimIndent()

        AndroidView(
            factory = { context ->
                WebView(context).apply {
                    setBackgroundColor(android.graphics.Color.TRANSPARENT)
                }
            },
            update = { webView ->
                webView.loadDataWithBaseURL(null, css + html, "text/html", "utf-8", null)
            },
            modifier = Modifier.fillMaxSize()
        )
    }
}
