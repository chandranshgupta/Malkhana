import os
import re
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, Preformatted
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.graphics.shapes import Drawing, Line
from reportlab.pdfgen import canvas

# Theme Palette (Brutalist / Blueprint Blueprint)
COLOR_INK = colors.HexColor('#0f172a')      # Very dark slate
COLOR_INK2 = colors.HexColor('#334155')     # Dark gray-slate
COLOR_ACCENT = colors.HexColor('#0ea5e9')   # Sky blue
COLOR_ACCENT2 = colors.HexColor('#0284c7')  # Darker sky blue
COLOR_LIGHT_BG = colors.HexColor('#f8fafc') # Very light slate
COLOR_BORDER = colors.HexColor('#cbd5e1')   # Light gray border

class NumberedCanvas(canvas.Canvas):
    """Canvas that computes total pages for footers."""
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        # 1. Background Diagonal Watermark
        self.saveState()
        self.setFont("Helvetica-Bold", 16)
        self.setFillColor(colors.HexColor('#0f172a'), alpha=0.04) # Ultra-subtle 4% opacity
        self.translate(297, 420)
        self.rotate(45)
        self.drawCentredString(0, 0, "CHANDRANSH GUPTA — FORENSIC CUSTODY SEAL")
        self.restoreState()

        # 2. Header and Footer Borders & Texts
        self.saveState()
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(COLOR_INK2)
        
        # Header (Top of every page)
        self.drawString(36, 810, "MALKHANA VAULT")
        self.setFont("Helvetica", 8)
        self.drawRightString(559, 810, "Forensic Admissibility & Cryptographic Custody")
        self.setStrokeColor(COLOR_BORDER)
        self.setLineWidth(0.5)
        self.line(36, 804, 559, 804)
        
        # Footer
        self.line(36, 45, 559, 45)
        self.drawString(36, 32, "DEVELOPED BY CHANDRANSH GUPTA | FORENSIC COMPLIANCE LABS")
        self.drawRightString(559, 32, f"Page {self._pageNumber} of {page_count}")
        
        self.restoreState()


def parse_markdown_to_story(md_path, styles, fits_single_page=False):
    """Parses markdown file and converts to reportlab story elements."""
    with open(md_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    story = []
    in_table = False
    table_headers = []
    table_rows = []
    
    in_code_block = False
    code_lines = []

    # Clean markdown formatting helpers
    def clean_text(text):
        # Replace bold markdown
        text = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', text)
        # Replace inline code markdown
        text = re.sub(r'`(.*?)`', r'<font face="Courier" size="8.5"><b>\1</b></font>', text)
        # Replace math notation formula from cryptographic whitepaper
        text = text.replace(r'$$H_{\text{entry}} = \text{SHA-256}(H_{\text{prev}} \mathbin{\Vert} \text{Type}_{\text{event}} \mathbin{\Vert} \text{Type}_{\text{entity}} \mathbin{\Vert} \text{ID}_{\text{entity}} \mathbin{\Vert} \text{Actor} \mathbin{\Vert} \text{Details})$$', 
                            '<b>H<sub>entry</sub></b> = <b>SHA-256</b>(H<sub>prev</sub> || Type<sub>event</sub> || Type<sub>entity</sub> || ID<sub>entity</sub> || Actor || Details)')
        text = text.replace(r'$\mathbin{\Vert}$', '||')
        return text.strip()

    # Determine spacing based on whether we need to fit it to single page
    spacer_h = 5 if fits_single_page else 8
    head_spacer_h = 6 if fits_single_page else 10

    for line_idx, line in enumerate(lines):
        stripped = line.strip()

        # Handle Code Blocks (preformatted text/flowcharts/mermaid)
        if stripped.startswith('```'):
            if in_code_block:
                in_code_block = False
                code_text = "\n".join(code_lines)
                # Render code block
                pre_style = ParagraphStyle(
                    'CodeStyle',
                    parent=styles['Normal'],
                    fontName='Courier',
                    fontSize=6.5 if fits_single_page else 7.5,
                    leading=8.5 if fits_single_page else 10,
                    textColor=COLOR_INK2,
                    backColor=COLOR_LIGHT_BG,
                    borderColor=COLOR_BORDER,
                    borderWidth=0.5,
                    borderPadding=6,
                    spaceAfter=spacer_h
                )
                story.append(Preformatted(code_text, pre_style))
                code_lines = []
            else:
                in_code_block = True
            continue

        if in_code_block:
            code_lines.append(line.rstrip('\n'))
            continue

        # Handle Tables
        if stripped.startswith('|'):
            # It's a table row
            if '---' in stripped:
                # Separator line, ignore
                continue
            in_table = True
            cols = [clean_text(c.strip()) for c in stripped.split('|')[1:-1]]
            if not table_headers:
                table_headers = cols
            else:
                table_rows.append(cols)
            continue
        elif in_table:
            # Table ended, render it
            in_table = False
            
            # Format paragraph cells inside table
            data = []
            # Headers
            header_style = ParagraphStyle(
                'TableHeader',
                fontName='Helvetica-Bold',
                fontSize=7 if fits_single_page else 8,
                leading=9 if fits_single_page else 10.5,
                textColor=colors.whitesmoke
            )
            cell_style = ParagraphStyle(
                'TableCell',
                fontName='Helvetica',
                fontSize=6.5 if fits_single_page else 7.5,
                leading=8.5 if fits_single_page else 10,
                textColor=COLOR_INK
            )
            bold_cell_style = ParagraphStyle(
                'TableBoldCell',
                fontName='Helvetica-Bold',
                fontSize=6.5 if fits_single_page else 7.5,
                leading=8.5 if fits_single_page else 10,
                textColor=COLOR_INK
            )
            
            data.append([Paragraph(h, header_style) for h in table_headers])
            for r in table_rows:
                row_cells = []
                for idx, cell in enumerate(r):
                    style = bold_cell_style if idx == 0 else cell_style
                    row_cells.append(Paragraph(cell, style))
                data.append(row_cells)

            # Determine column widths dynamically (A4 printable width is 595 - 72 = 523)
            if len(table_headers) == 6:
                col_widths = [35, 60, 85, 95, 65, 183] # sum = 523
            elif len(table_headers) == 4:
                col_widths = [110, 60, 130, 223] # sum = 523
            else:
                col_widths = None

            t = Table(data, colWidths=col_widths)
            
            # Table styling
            t_style = [
                ('BACKGROUND', (0, 0), (-1, 0), COLOR_INK2),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 3 if fits_single_page else 5),
                ('TOPPADDING', (0, 0), (-1, -1), 3 if fits_single_page else 5),
                ('LEFTPADDING', (0, 0), (-1, -1), 4 if fits_single_page else 6),
                ('RIGHTPADDING', (0, 0), (-1, -1), 4 if fits_single_page else 6),
                ('GRID', (0, 0), (-1, -1), 0.5, COLOR_BORDER),
            ]
            
            # Alternating row colors
            for idx in range(1, len(data)):
                if idx % 2 == 0:
                    t_style.append(('BACKGROUND', (0, idx), (-1, idx), COLOR_LIGHT_BG))
                    
            t.setStyle(TableStyle(t_style))
            story.append(t)
            story.append(Spacer(1, spacer_h))
            
            table_headers = []
            table_rows = []
            continue

        if not stripped:
            continue

        # Handle Headers
        if stripped.startswith('# '):
            title_text = clean_text(stripped[2:])
            story.append(Spacer(1, 8))
            story.append(Paragraph(title_text, styles['DocTitle']))
            story.append(Spacer(1, 2))
        elif stripped.startswith('## '):
            header_text = clean_text(stripped[3:])
            story.append(Spacer(1, head_spacer_h))
            story.append(Paragraph(header_text, styles['SectionHeader']))
            story.append(Spacer(1, 4))
        elif stripped.startswith('### '):
            header_text = clean_text(stripped[4:])
            story.append(Spacer(1, head_spacer_h - 2))
            story.append(Paragraph(header_text, styles['SubSectionHeader']))
            story.append(Spacer(1, 3))
        elif stripped.startswith('---'):
            d = Drawing(523, 5)
            d.add(Line(0, 2, 523, 2, strokeColor=COLOR_BORDER, strokeWidth=0.5))
            story.append(d)
            story.append(Spacer(1, spacer_h))
        # Handle bullet points
        elif stripped.startswith('- '):
            bullet_text = clean_text(stripped[2:])
            bullet_style = ParagraphStyle(
                'BulletStyle',
                parent=styles['Normal'],
                leftIndent=15,
                firstLineIndent=-10,
                spaceAfter=2 if fits_single_page else 4
            )
            story.append(Paragraph(f"&bull; {bullet_text}", bullet_style))
        # Handle numbered lists
        elif re.match(r'^\d+\.\s', stripped):
            num_text = clean_text(re.sub(r'^\d+\.\s', '', stripped))
            num_prefix = re.match(r'^(\d+)\.\s', stripped).group(1)
            num_style = ParagraphStyle(
                'NumberedStyle',
                parent=styles['Normal'],
                leftIndent=15,
                firstLineIndent=-10,
                spaceAfter=2 if fits_single_page else 4
            )
            story.append(Paragraph(f"{num_prefix}. {num_text}", num_style))
        else:
            # Handle Subtitles and Normal Paragraphs
            para_text = clean_text(stripped)
            if para_text.startswith('<b>') and para_text.endswith('</b>') and line_idx <= 2:
                story.append(Paragraph(para_text, styles['DocSubtitle']))
                story.append(Spacer(1, 6))
            else:
                story.append(Paragraph(para_text, styles['BodyText']))
                story.append(Spacer(1, spacer_h))

    return story


def build_pdf(md_path, pdf_path, fits_single_page=False):
    """Builds a formatted PDF from markdown source."""
    margin = 36
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=A4,
        leftMargin=margin,
        rightMargin=margin,
        topMargin=54,
        bottomMargin=54
    )

    base_styles = getSampleStyleSheet()
    styles = {}
    styles['Normal'] = base_styles['Normal']
    
    body_font_size = 8 if fits_single_page else 9.5
    body_leading = 10.5 if fits_single_page else 13.5
    styles['BodyText'] = ParagraphStyle(
        'CustomBodyText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=body_font_size,
        leading=body_leading,
        textColor=COLOR_INK,
        spaceAfter=3 if fits_single_page else 6
    )
    
    styles['DocTitle'] = ParagraphStyle(
        'CustomDocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=13 if fits_single_page else 16,
        leading=16 if fits_single_page else 20,
        textColor=COLOR_INK,
        spaceAfter=4
    )
    
    styles['DocSubtitle'] = ParagraphStyle(
        'CustomDocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9 if fits_single_page else 10.5,
        leading=12 if fits_single_page else 14.5,
        textColor=COLOR_INK2,
        spaceAfter=6
    )

    styles['SectionHeader'] = ParagraphStyle(
        'CustomSectionHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10 if fits_single_page else 12,
        leading=13.5 if fits_single_page else 16,
        textColor=COLOR_ACCENT2,
        keepWithNext=True
    )

    styles['SubSectionHeader'] = ParagraphStyle(
        'CustomSubSectionHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5 if fits_single_page else 10,
        leading=11.5 if fits_single_page else 13.5,
        textColor=COLOR_INK,
        keepWithNext=True
    )

    story = parse_markdown_to_story(md_path, styles, fits_single_page)
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Generated PDF: {pdf_path}")


if __name__ == '__main__':
    # Compiling all requested guides and whitepapers to PDFs
    targets = [
        # Collaterals
        ('docs/collateral/product-brief.md', 'docs/collateral/product-brief.pdf', True),
        ('docs/collateral/cryptographic-whitepaper.md', 'docs/collateral/cryptographic-whitepaper.pdf', False),
        
        # Primary Guides
        ('docs/session-custody.md', 'docs/session-custody.pdf', False),
        ('docs/triple-hash.md', 'docs/triple-hash.pdf', False),
        ('docs/evaluation.md', 'docs/evaluation.pdf', False),
        ('docs/hardware-faq.md', 'docs/hardware-faq.pdf', False),
        ('docs/contributing.md', 'docs/contributing.pdf', False),
    ]
    
    for md_file, pdf_file, single_page in targets:
        if os.path.exists(md_file):
            build_pdf(md_file, pdf_file, fits_single_page=single_page)
        else:
            print(f"Warning: File not found: {md_file}")
