package com.mdify.app.data

import android.content.Context
import android.net.Uri
import com.mdify.app.model.ConversionResult

class ConversionEngine(private val context: Context) {
    suspend fun convert(uri: Uri, fileName: String, fileSize: Long): ConversionResult {
        return when {
            fileName.endsWith(".pdf", ignoreCase = true) -> {
                val pdfResult = PdfMarkdownConverter(context).convert(uri)
                ConversionResult(
                    fileName = fileName,
                    fileSize = fileSize,
                    fileType = "pdf",
                    markdown = pdfResult.markdown,
                    pageCount = pdfResult.pageCount
                )
            }

            fileName.endsWith(".docx", ignoreCase = true) -> {
                ConversionResult(
                    fileName = fileName,
                    fileSize = fileSize,
                    fileType = "docx",
                    markdown = DocxMarkdownConverter(context).convert(uri)
                )
            }

            else -> error("Unsupported file type")
        }
    }
}
