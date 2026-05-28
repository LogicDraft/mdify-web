package com.mdify.app.data

import android.content.Context
import android.net.Uri
import org.xmlpull.v1.XmlPullParser
import org.xmlpull.v1.XmlPullParserFactory
import java.io.InputStream
import java.util.Locale
import java.util.zip.ZipInputStream

class DocxMarkdownConverter(private val context: Context) {
    fun convert(uri: Uri): String {
        context.contentResolver.openInputStream(uri).use { input ->
            requireNotNull(input) { "Unable to open DOCX file" }
            return convertDocumentXml(findDocumentXml(input))
        }
    }

    private fun findDocumentXml(inputStream: InputStream): String {
        ZipInputStream(inputStream).use { zip ->
            generateSequence { zip.nextEntry }.forEach { entry ->
                if (entry.name == "word/document.xml") {
                    return zip.bufferedReader().readText()
                }
            }
        }
        error("The DOCX file is missing word/document.xml")
    }

    private fun convertDocumentXml(xml: String): String {
        val parser = XmlPullParserFactory.newInstance().newPullParser().apply {
            setInput(xml.reader())
        }

        val markdown = StringBuilder()
        val paragraphBuffer = StringBuilder()
        var paragraphStyle = ""
        var isListParagraph = false
        var inTable = false
        var tableRow = mutableListOf<String>()
        var tableRows = mutableListOf<List<String>>()

        fun flushParagraph() {
            val raw = paragraphBuffer.toString().trim()
            if (raw.isEmpty()) {
                paragraphBuffer.clear()
                paragraphStyle = ""
                isListParagraph = false
                return
            }

            val line = when {
                paragraphStyle.startsWith("heading", ignoreCase = true) -> {
                    val level = paragraphStyle.filter(Char::isDigit).toIntOrNull()?.coerceIn(1, 6) ?: 1
                    "${"#".repeat(level)} $raw"
                }
                paragraphStyle.contains("title", ignoreCase = true) -> "# $raw"
                isListParagraph -> "- $raw"
                else -> raw
            }

            markdown.appendLine(line).appendLine()
            paragraphBuffer.clear()
            paragraphStyle = ""
            isListParagraph = false
        }

        fun flushTable() {
            if (tableRows.isEmpty()) return
            val header = tableRows.first()
            markdown.appendLine(header.joinToString(prefix = "| ", postfix = " |", separator = " | "))
            markdown.appendLine(header.joinToString(prefix = "| ", postfix = " |", separator = " | ") { "---" })
            tableRows.drop(1).forEach { row ->
                markdown.appendLine(row.joinToString(prefix = "| ", postfix = " |", separator = " | "))
            }
            markdown.appendLine()
            tableRows = mutableListOf()
        }

        while (parser.eventType != XmlPullParser.END_DOCUMENT) {
            when (parser.eventType) {
                XmlPullParser.START_TAG -> when (parser.name.lowercase(Locale.US)) {
                    "w:p" -> {
                        if (inTable && tableRow.isNotEmpty()) {
                            tableRows.add(tableRow.toList())
                            tableRow = mutableListOf()
                        }
                    }
                    "w:pstyle" -> paragraphStyle = parser.getAttributeValue(null, "val").orEmpty()
                    "w:numpr" -> isListParagraph = true
                    "w:t" -> {
                        val text = parser.nextText()
                        if (inTable) {
                            tableRow.add(text.trim())
                        } else {
                            paragraphBuffer.append(text)
                        }
                    }
                    "w:tbl" -> {
                        flushParagraph()
                        inTable = true
                    }
                    "w:tab" -> paragraphBuffer.append("    ")
                    "w:br" -> paragraphBuffer.append('\n')
                }

                XmlPullParser.END_TAG -> when (parser.name.lowercase(Locale.US)) {
                    "w:p" -> if (!inTable) flushParagraph()
                    "w:tr" -> if (tableRow.isNotEmpty()) {
                        tableRows.add(tableRow.toList())
                        tableRow = mutableListOf()
                    }
                    "w:tbl" -> {
                        inTable = false
                        flushTable()
                    }
                }
            }
            parser.next()
        }

        flushParagraph()
        flushTable()
        return markdown.toString()
            .replace(Regex("\n{3,}"), "\n\n")
            .trim()
    }
}
