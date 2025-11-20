<style>
    html, body {
        margin: 0;
        padding: 0;
        width: 100%;
    }

    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        font-family: 'Helvetica', 'Arial', sans-serif;
    }

    body {
        color: #333;
        line-height: 1.5;
        font-size: 11px;
    }


    /* Header */
    .header {
        text-align: center;
        margin-bottom: 25px;
        padding-bottom: 15px;
        border-bottom: 2px solid #002D5B;
    }

    .logo {
        height: 45px;
        margin-bottom: 10px;
    }

    .header h1 {
        font-size: 20px;
        color: #1F2937;
        margin-bottom: 3px;
        font-weight: bold;
    }

    .header .subtitle {
        font-size: 12px;
        color: #4B5563;
        margin-top: 0;
        margin-bottom: 8px;
    }

    .header-meta {
        width: 100%;
        margin-top: 10px;
        font-size: 10px;
        color: #555;
    }

    /* Filters Section */
    .filters-section {
        background-color: #F3F4F6;
        border: 1px solid #E5E7EB;
        border-radius: 8px;
        padding: 15px;
        margin-bottom: 25px;
        page-break-inside: avoid;
    }

    .filters-section h3 {
        font-size: 12px;
        font-weight: bold;
        text-transform: uppercase;
        color: #4B5563;
        margin-bottom: 12px;
        letter-spacing: 0.5px;
    }

    .filters-table {
        width: 100%;
        border-collapse: collapse;
    }

    .filters-table td {
        width: 25%;
        padding: 5px;
        vertical-align: top;
    }

    .filter-label {
        font-size: 10px;
        font-weight: bold;
        text-transform: uppercase;
        color: #6B7280;
    }

    .filter-value {
        font-size: 12px;
        color: #1F2937;
    }

    /* Section Headers */
    .section-header {
        font-size: 16px;
        font-weight: bold;
        color: #002D5B;
        margin-top: 20px;
        margin-bottom: 8px;
        padding-bottom: 6px;
        border-bottom: 1px solid #D1D5DB;
    }

    .section-description {
        font-size: 12px;
        color: #4B5563;
        margin-bottom: 15px;
    }

    /* Summary Cards */
    .summary-card {
        background-color: #FFFFFF;
        border: 1px solid #E5E7EB;
        border-radius: 8px;
        padding: 15px;
        margin-bottom: 15px;
        page-break-inside: avoid;
    }

    .summary-card h2 {
        font-size: 20px;
        color: #111827;
        margin-bottom: 2px;
    }

    .summary-card .identifier {
        font-size: 12px;
        color: #6B7280;
        font-family: monospace;
        margin-bottom: 15px;
    }

    .summary-badge {
        display: inline-block;
        padding: 5px 12px;
        border-radius: 12px;
        font-size: 11px;
        font-weight: bold;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .badge-success { background-color: #D1FAE5; color: #065F46; }
    .badge-warning { background-color: #FEF3C7; color: #92400E; }
    .badge-danger { background-color: #FEE2E2; color: #991B1B; }
    .badge-secondary { background-color: #E5E7EB; color: #374151; }

    .info-table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 15px;
    }

    .info-table th {
        font-size: 11px;
        font-weight: bold;
        color: #1F2937;
        text-transform: uppercase;
        border-bottom: 1px solid #E5E7EB;
        padding: 0 8px 8px 8px;
        text-align: left;
        vertical-align: top;
    }

    .info-table td {
        padding: 8px;
        vertical-align: top;
    }

    .info-label {
        font-size: 10px;
        font-weight: bold;
        text-transform: uppercase;
        color: #6B7280;
        margin-bottom: 2px;
    }

    .info-value {
        font-size: 11px;
        color: #1F2937;
    }

    /* Tables */
    table.data-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 20px;
        font-size: 10px;
    }

    .data-table thead {
        background-color: #1F2937;
        color: #FFFFFF;
    }

    .data-table th {
        padding: 8px;
        text-align: left;
        font-weight: bold;
        border: 1px solid #1F2937;
    }

    .data-table td {
        padding: 8px;
        border: 1px solid #E5E7EB;
        vertical-align: middle;
    }

    .data-table tbody tr:nth-child(even) {
        background-color: #F9FAFB;
    }

    /* Empty state */
    .empty-state {
        text-align: center;
        padding: 30px;
        color: #6B7280;
        font-size: 12px;
        background-color: #F9FAFB;
        border: 1px dashed #D1D5DB;
        border-radius: 8px;
    }

    /* Footer */
    .footer {
        margin-top: 30px;
        padding-top: 15px;
        border-top: 1px solid #E5E7EB;
        text-align: center;
        font-size: 10px;
        color: #9CA3AF;
    }

    /* Utilities */
    .text-right { text-align: right; }
    .page-break { page-break-after: always; }
    .clearfix::after {
        content: "";
        clear: both;
        display: table;
    }
</style>
