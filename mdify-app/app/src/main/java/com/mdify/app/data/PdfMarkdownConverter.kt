package com.mdify.app.data

import android.content.Context
import android.net.Uri
import com.tom_roush.pdfbox.android.PDFBoxResourceLoader
import com.tom_roush.pdfbox.pdmodel.PDDocument
import com.tom_roush.pdfbox.text.PDFTextStripper

data class PdfConversionResult(
    val markdown: String,
    val pageCount: Int
)

class PdfMarkdownConverter(private val context: Context) {
    fun convert(uri: Uri): PdfConversionResult {
        PDFBoxResourceLoader.init(context)

        context.contentResolver.openInputStream(uri).use { input ->
            requireNotNull(input) { "Unable to open PDF file" }
            PDDocument.load(input).use { document ->
                val stripper = PDFTextStripper()
                val pages = (1..document.numberOfPages).map { page ->
                    stripper.startPage = page
                    stripper.endPage = page
                    cleanPage(stripper.getText(document))
                }

                return PdfConversionResult(
                    markdown = pages.joinToString("\n\n---\n\n").trim(),
                    pageCount = document.numberOfPages
                )
            }
        }
    }

    private fun cleanPage(text: String): String {
        val lines = text.lines()
            .map { it.trimEnd() }
            .filter { it.isNotBlank() }

        return buildString {
            lines.forEach { line ->
                appendLine(
                    when {
                        line.matches(Regex("^\\d+[.)]\\s+.*")) -> "1. ${line.replace(Regex("^\\d+[.)]\\s+"), "")}"
                        line.matches(Regex("^[-*•]\\s+.*")) -> "- ${line.replace(Regex("^[-*•]\\s+"), "")}"
                        line.length in 5..70 && line == line.uppercase() -> "## ${line.lowercase().replaceFirstChar(Char::titlecase)}"
                        else -> line
                    }
                )
            }
        }.replace(Regex("\n{3,}"), "\n\n").trim()
    }
}
