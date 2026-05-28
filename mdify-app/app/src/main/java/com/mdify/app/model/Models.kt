package com.mdify.app.model

import kotlinx.serialization.Serializable

enum class MdifyScreen {
    Home,
    Processing,
    Preview
}

enum class PreviewMode {
    Split,
    Editor,
    Preview
}

data class UiState(
    val screen: MdifyScreen = MdifyScreen.Home,
    val history: List<ConversionHistoryItem> = emptyList(),
    val currentResult: ConversionResult? = null,
    val markdownDraft: String = "",
    val processingFileName: String = "",
    val processingStatus: String = "Waiting",
    val processingProgress: Float = 0f,
    val previewMode: PreviewMode = PreviewMode.Split,
    val pendingMessage: String? = null,
    val shareRequestKey: Long = 0L
)

@Serializable
data class ConversionHistoryItem(
    val id: String,
    val fileName: String,
    val fileSize: Long,
    val fileType: String,
    val markdown: String,
    val convertedAt: Long,
    val conversionTimeMs: Long,
    val pageCount: Int? = null
) {
    fun toResult(): ConversionResult = ConversionResult(
        fileName = fileName,
        fileSize = fileSize,
        fileType = fileType,
        markdown = markdown,
        conversionTimeMs = conversionTimeMs,
        pageCount = pageCount
    )
}

data class ConversionResult(
    val fileName: String,
    val fileSize: Long,
    val fileType: String,
    val markdown: String,
    val conversionTimeMs: Long = 0L,
    val pageCount: Int? = null
) {
    fun toHistoryItem(): ConversionHistoryItem = ConversionHistoryItem(
        id = "${fileName}-${convertedAtKey()}",
        fileName = fileName,
        fileSize = fileSize,
        fileType = fileType,
        markdown = markdown,
        convertedAt = System.currentTimeMillis(),
        conversionTimeMs = conversionTimeMs,
        pageCount = pageCount
    )
}

private fun convertedAtKey(): Long = System.currentTimeMillis()
