package com.agenda.backend.service;

import com.agenda.backend.entity.Actividad;
import com.agenda.backend.entity.Actividad.EstadoActividad;
import lombok.RequiredArgsConstructor;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ExportService {

    private final ActividadService actividadService;

    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    private List<Actividad> actividadesUsuarioActual(String filtroEstado) {
        List<Actividad> base = actividadService.listarPorUsuario();

        if (filtroEstado == null || filtroEstado.isBlank() || "all".equalsIgnoreCase(filtroEstado)) {
            // Todas las actividades (excepto canceladas)
            return base.stream()
                    .filter(a -> a.getEstado() != EstadoActividad.cancelled)
                    .toList();
        }

        if ("done".equalsIgnoreCase(filtroEstado) || "completadas".equalsIgnoreCase(filtroEstado)) {
            // Solo completadas
            return base.stream()
                    .filter(a -> a.getEstado() == EstadoActividad.done)
                    .toList();
        }

        if ("pending".equalsIgnoreCase(filtroEstado) || "pendientes".equalsIgnoreCase(filtroEstado)) {
            // Pendientes por gestionar (no hechas ni canceladas)
            return base.stream()
                    .filter(a -> a.getEstado() != EstadoActividad.done && a.getEstado() != EstadoActividad.cancelled)
                    .toList();
        }

        // Filtro desconocido: devolver todas (no canceladas)
        return base.stream()
                .filter(a -> a.getEstado() != EstadoActividad.cancelled)
                .toList();
    }

    public byte[] exportarExcel(String filtroEstado) {
        List<Actividad> actividades = actividadesUsuarioActual(filtroEstado);
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream bos = new ByteArrayOutputStream()) {
            String sheetName;
            if ("done".equalsIgnoreCase(filtroEstado) || "completadas".equalsIgnoreCase(filtroEstado)) {
                sheetName = "Completadas";
            } else if ("pending".equalsIgnoreCase(filtroEstado) || "pendientes".equalsIgnoreCase(filtroEstado)) {
                sheetName = "Pendientes";
            } else {
                sheetName = "Todas";
            }

            Sheet sheet = workbook.createSheet(sheetName);
            int rowIdx = 0;

            // Encabezados
            Row header = sheet.createRow(rowIdx++);
            String[] cols = {"ID", "Nombre", "Descripción", "Área", "Prioridad", "Fecha límite", "Fecha finalización"};
            for (int i = 0; i < cols.length; i++) {
                header.createCell(i).setCellValue(cols[i]);
            }

            // Datos
            for (Actividad a : actividades) {
                Row r = sheet.createRow(rowIdx++);
                int c = 0;
                r.createCell(c++).setCellValue(a.getId() != null ? a.getId() : 0L);
                r.createCell(c++).setCellValue(ns(a.getNombre()));
                r.createCell(c++).setCellValue(ns(a.getDescripcion()));
                r.createCell(c++).setCellValue(ns(a.getArea()));
                r.createCell(c++).setCellValue(a.getPrioridad() != null ? a.getPrioridad().name() : "");
                r.createCell(c++).setCellValue(a.getFechaLimite() != null ? a.getFechaLimite().format(FMT) : "");
                r.createCell(c).setCellValue(a.getFechaFinalizacion() != null ? a.getFechaFinalizacion().format(FMT) : "");
            }

            for (int i = 0; i < 7; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(bos);
            return bos.toByteArray();
        } catch (IOException e) {
            throw new IllegalStateException("No se pudo generar el archivo Excel de actividades realizadas", e);
        }
    }

    public byte[] exportarPdf(String filtroEstado) {
        List<Actividad> actividades = actividadesUsuarioActual(filtroEstado);
        try (PDDocument doc = new PDDocument(); ByteArrayOutputStream bos = new ByteArrayOutputStream()) {
            PDPage page = new PDPage();
            doc.addPage(page);
            PDPageContentStream content = new PDPageContentStream(doc, page);

            float margin = 40f;
            float y = page.getMediaBox().getHeight() - margin;
            float leading = 14f;

            // Título
            content.setFont(PDType1Font.HELVETICA_BOLD, 14);
            content.beginText();
            content.newLineAtOffset(margin, y);
            String titulo;
            if ("done".equalsIgnoreCase(filtroEstado) || "completadas".equalsIgnoreCase(filtroEstado)) {
                titulo = "Actividades realizadas";
            } else if ("pending".equalsIgnoreCase(filtroEstado) || "pendientes".equalsIgnoreCase(filtroEstado)) {
                titulo = "Actividades pendientes por gestionar";
            } else {
                titulo = "Todas las actividades";
            }
            content.showText(titulo);
            content.endText();
            y -= leading * 2;

            content.setFont(PDType1Font.HELVETICA, 10);

            for (Actividad a : actividades) {
                if (y <= margin) {
                    content.close();
                    page = new PDPage();
                    doc.addPage(page);
                    content = new PDPageContentStream(doc, page);
                    content.setFont(PDType1Font.HELVETICA, 10);
                    y = page.getMediaBox().getHeight() - margin;
                }

                String linea1 = String.format("(%d) %s", a.getId(), ns(a.getNombre()));
                String linea2 = String.format("Área: %s  |  Prioridad: %s", ns(a.getArea()),
                        a.getPrioridad() != null ? a.getPrioridad().name() : "");
                String linea3 = String.format("Límite: %s  |  Finalizada: %s",
                        a.getFechaLimite() != null ? a.getFechaLimite().format(FMT) : "",
                        a.getFechaFinalizacion() != null ? a.getFechaFinalizacion().format(FMT) : "-");
                String desc = ns(a.getDescripcion());

                content.beginText();
                content.newLineAtOffset(margin, y);
                content.showText(linea1);
                content.endText();
                y -= leading;

                if (!desc.isEmpty()) {
                    if (y <= margin) {
                        content.close();
                        page = new PDPage();
                        doc.addPage(page);
                        content = new PDPageContentStream(doc, page);
                        content.setFont(PDType1Font.HELVETICA, 10);
                        y = page.getMediaBox().getHeight() - margin;
                    }
                    content.beginText();
                    content.newLineAtOffset(margin + 10, y);
                    content.showText("Desc: " + desc);
                    content.endText();
                    y -= leading;
                }

                if (y <= margin) {
                    content.close();
                    page = new PDPage();
                    doc.addPage(page);
                    content = new PDPageContentStream(doc, page);
                    content.setFont(PDType1Font.HELVETICA, 10);
                    y = page.getMediaBox().getHeight() - margin;
                }

                content.beginText();
                content.newLineAtOffset(margin + 10, y);
                content.showText(linea2);
                content.endText();
                y -= leading;

                if (y <= margin) {
                    content.close();
                    page = new PDPage();
                    doc.addPage(page);
                    content = new PDPageContentStream(doc, page);
                    content.setFont(PDType1Font.HELVETICA, 10);
                    y = page.getMediaBox().getHeight() - margin;
                }

                content.beginText();
                content.newLineAtOffset(margin + 10, y);
                content.showText(linea3);
                content.endText();
                y -= leading * 1.5f;
            }

            content.close();
            doc.save(bos);
            return bos.toByteArray();
        } catch (IOException e) {
            throw new IllegalStateException("No se pudo generar el PDF de actividades realizadas", e);
        }
    }

    private static String ns(String s) {
        return s != null ? s : "";
    }
}
