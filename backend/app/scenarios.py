"""Synthetic scenario library — "we bring the doc."

Every battle runs on a fully synthetic matter, so no user ever has to upload
sensitive material to play (the BYOD path is deliberately not in the MVP).
Scenarios carry structured facts the work-product generators consume: planted
issues for redlines, expected postings for journal entries, and so on — which
is also what makes gold-standard traps constructible (we know the right answer).
"""
from __future__ import annotations

import random

SCENARIOS: dict[str, list[dict]] = {
    # ------------------------------------------------------------------
    "contract-redline": [
        {
            "id": "nda-vendor-onesided",
            "title": "One-sided vendor NDA",
            "brief": "Redline this NDA from Northbeam Analytics (vendor paper). We're the receiving party at Halcyon Manufacturing. Bring it to our standard positions.",
            "parties": {"disclosing": "Northbeam Analytics, Inc.", "receiving": "Halcyon Manufacturing LLC"},
            "issues": [
                {"clause": "Term", "problem": "Five-year confidentiality term", "fix": "reduce to two years from disclosure"},
                {"clause": "Definition", "problem": "Confidential Information covers anything 'related to' the business", "fix": "limit to information marked or reasonably understood as confidential"},
                {"clause": "Carve-outs", "problem": "No exception for independently developed information", "fix": "add independent-development and prior-knowledge carve-outs"},
                {"clause": "Remedies", "problem": "Injunctive relief available only to the disclosing party", "fix": "make equitable remedies mutual"},
            ],
        },
        {
            "id": "nda-mutual-acquirer",
            "title": "Mutual NDA for an acquisition talk",
            "brief": "We're exploring an acquisition of Bluepine Robotics. Redline their mutual NDA — watch the non-solicit and the residuals clause.",
            "parties": {"disclosing": "Bluepine Robotics Corp.", "receiving": "Halcyon Manufacturing LLC"},
            "issues": [
                {"clause": "Non-solicit", "problem": "Blanket two-year non-solicit of all employees", "fix": "limit to senior employees contacted during diligence, one year, with general-solicitation carve-out"},
                {"clause": "Residuals", "problem": "Broad residuals clause lets either side use anything remembered", "fix": "strike or limit residuals to general know-how excluding technical specifications"},
                {"clause": "Return", "problem": "No obligation to destroy or return materials on termination", "fix": "add return/destroy within 30 days with certification"},
                {"clause": "Term", "problem": "Confidentiality survives indefinitely", "fix": "cap survival at three years except trade secrets"},
            ],
        },
        {
            "id": "nda-contractor",
            "title": "Contractor NDA with IP creep",
            "brief": "Standard contractor NDA for a design freelancer — except their counsel slipped in IP assignment language. Redline to keep it a pure NDA.",
            "parties": {"disclosing": "Halcyon Manufacturing LLC", "receiving": "Meridian Design Studio"},
            "issues": [
                {"clause": "IP Assignment", "problem": "NDA assigns all work product IP — belongs in the services agreement", "fix": "strike assignment language; reference the master services agreement"},
                {"clause": "Definition", "problem": "Feedback and suggestions defined as Confidential Information of the contractor", "fix": "feedback is freely usable by the company"},
                {"clause": "Publicity", "problem": "Contractor may reference the engagement in marketing", "fix": "require prior written consent for any publicity"},
                {"clause": "Term", "problem": "Obligations end when the agreement ends", "fix": "confidentiality survives termination for two years"},
            ],
        },
    ],
    # ------------------------------------------------------------------
    "clause-risk": [
        {
            "id": "saas-msa-review",
            "title": "SaaS MSA risk sweep",
            "brief": "Rate the risk of these five clauses from a SaaS master services agreement we're about to sign as the customer, and say what you'd push back on.",
            "clauses": [
                {"name": "Limitation of Liability", "text": "Provider's total liability shall not exceed the fees paid in the one (1) month preceding the claim; all indirect damages are excluded, including for breaches of confidentiality.", "true_risk": "High", "why": "One-month cap is far below market and the carve-out for confidentiality breaches is missing"},
                {"name": "Termination", "text": "Provider may terminate this Agreement at any time upon notice; Customer may terminate only for uncured material breach.", "true_risk": "High", "why": "Asymmetric termination leaves the customer locked in while the provider can walk"},
                {"name": "Auto-Renewal", "text": "The term renews automatically for successive twelve-month periods unless either party gives ninety (90) days' notice.", "true_risk": "Medium", "why": "90-day window is long but workable with calendaring"},
                {"name": "Data Ownership", "text": "Customer retains all right, title and interest in Customer Data; Provider receives a license solely to provide the Services.", "true_risk": "Low", "why": "Customer-favorable as written"},
                {"name": "Assignment", "text": "Neither party may assign without consent, except to an affiliate or in connection with a merger or sale of substantially all assets.", "true_risk": "Low", "why": "Standard mutual carve-outs"},
            ],
        },
        {
            "id": "lease-renewal-review",
            "title": "Office lease renewal traps",
            "brief": "We're renewing our office lease. Rate the risk in these five clauses from the landlord's draft and flag what needs negotiation.",
            "clauses": [
                {"name": "Operating Expenses", "text": "Tenant shall pay its proportionate share of all Operating Expenses, which Landlord may adjust at its reasonable discretion, without an audit right.", "true_risk": "High", "why": "Uncapped pass-throughs with no audit right invite cost creep"},
                {"name": "Relocation", "text": "Landlord may relocate Tenant to comparable premises within the building upon sixty (60) days' notice at Tenant's cost.", "true_risk": "High", "why": "Relocation at tenant's cost is aggressive and disruptive"},
                {"name": "Holdover", "text": "Holdover rent shall be 150% of the last month's Base Rent.", "true_risk": "Medium", "why": "150% is within market range but worth negotiating to 125%"},
                {"name": "Quiet Enjoyment", "text": "Landlord covenants that Tenant shall peaceably hold the Premises subject to the terms hereof.", "true_risk": "Low", "why": "Standard covenant"},
                {"name": "Notices", "text": "Notices shall be delivered by certified mail or nationally recognized overnight courier to the addresses set forth above.", "true_risk": "Low", "why": "Boilerplate"},
            ],
        },
    ],
    # ------------------------------------------------------------------
    "journal-entry": [
        {
            "id": "annual-prepaid-saas",
            "title": "Annual SaaS collected upfront",
            "brief": "On November 1 we collected $12,000 cash for a 12-month software subscription starting that day. Record the receipt and November's revenue recognition.",
            "entries": [
                {"desc": "Cash receipt on Nov 1", "lines": [("Cash", 12000, 0), ("Deferred Revenue", 0, 12000)]},
                {"desc": "November revenue recognition", "lines": [("Deferred Revenue", 1000, 0), ("Subscription Revenue", 0, 1000)]},
            ],
            "wrong_account": "Sales Revenue",
        },
        {
            "id": "fixed-asset-purchase",
            "title": "Machine purchase with freight",
            "brief": "We bought a packaging machine for $45,000 on credit, paid $2,500 cash freight to get it here, and it went into service the same day. Record the acquisition and one month of straight-line depreciation (5-year life, no salvage).",
            "entries": [
                {"desc": "Machine acquisition", "lines": [("Machinery & Equipment", 47500, 0), ("Accounts Payable", 0, 45000), ("Cash", 0, 2500)]},
                {"desc": "One month depreciation", "lines": [("Depreciation Expense", 792, 0), ("Accumulated Depreciation", 0, 792)]},
            ],
            "wrong_account": "Repairs & Maintenance Expense",
        },
        {
            "id": "bad-debt-writeoff",
            "title": "Write-off under the allowance method",
            "brief": "Customer Orion Retail's $8,400 receivable is uncollectible; we use the allowance method. Later that month they unexpectedly paid $3,000. Record both events.",
            "entries": [
                {"desc": "Write-off of Orion receivable", "lines": [("Allowance for Doubtful Accounts", 8400, 0), ("Accounts Receivable", 0, 8400)]},
                {"desc": "Recovery — reinstate and collect", "lines": [("Accounts Receivable", 3000, 0), ("Allowance for Doubtful Accounts", 0, 3000), ("Cash", 3000, 0), ("Accounts Receivable", 0, 3000)]},
            ],
            "wrong_account": "Bad Debt Expense",
        },
    ],
    # ------------------------------------------------------------------
    "coa-mapping": [
        {
            "id": "legacy-to-s4-migration",
            "title": "Legacy GL → new ERP chart",
            "brief": "Map these legacy general-ledger accounts to the new ERP chart of accounts for the migration cutover.",
            "target_coa": ["1000 Cash & Equivalents", "1100 Accounts Receivable", "1500 Fixed Assets", "2000 Accounts Payable", "2400 Accrued Liabilities", "4000 Product Revenue", "5000 Cost of Goods Sold", "6100 Payroll Expense", "6400 Rent & Facilities", "6900 Other Operating Expense"],
            "legacy": [
                {"code": "101-CASH-OP", "name": "Operating Checking - First National", "correct": "1000 Cash & Equivalents"},
                {"code": "115-AR-TRADE", "name": "Trade Debtors", "correct": "1100 Accounts Receivable"},
                {"code": "150-EQUIP", "name": "Plant Machinery (net)", "correct": "1500 Fixed Assets"},
                {"code": "201-AP-TRADE", "name": "Trade Creditors", "correct": "2000 Accounts Payable"},
                {"code": "215-ACCR-PR", "name": "Accrued Wages & Bonus", "correct": "2400 Accrued Liabilities"},
                {"code": "401-SALES-DOM", "name": "Domestic Product Sales", "correct": "4000 Product Revenue"},
                {"code": "501-MATL", "name": "Direct Materials Consumed", "correct": "5000 Cost of Goods Sold"},
                {"code": "601-SAL", "name": "Salaries & Wages - Admin", "correct": "6100 Payroll Expense"},
                {"code": "640-RENT", "name": "Office & Warehouse Rent", "correct": "6400 Rent & Facilities"},
                {"code": "699-MISC", "name": "Sundry Expenses", "correct": "6900 Other Operating Expense"},
            ],
        },
        {
            "id": "acquired-sub-integration",
            "title": "Acquired subsidiary onto parent chart",
            "brief": "We acquired Cobalt Fabrication. Map their chart onto our parent chart of accounts for consolidation.",
            "target_coa": ["1000 Cash & Equivalents", "1200 Inventory", "1500 Fixed Assets", "2000 Accounts Payable", "2600 Deferred Revenue", "4000 Product Revenue", "4500 Service Revenue", "5000 Cost of Goods Sold", "6200 Sales & Marketing", "6900 Other Operating Expense"],
            "legacy": [
                {"code": "CB-1010", "name": "Petty Cash & Bank", "correct": "1000 Cash & Equivalents"},
                {"code": "CB-1300", "name": "Raw Steel Stock", "correct": "1200 Inventory"},
                {"code": "CB-1620", "name": "CNC Machines at Cost", "correct": "1500 Fixed Assets"},
                {"code": "CB-2100", "name": "Supplier Balances Owing", "correct": "2000 Accounts Payable"},
                {"code": "CB-2350", "name": "Customer Deposits - Unearned", "correct": "2600 Deferred Revenue"},
                {"code": "CB-4100", "name": "Fabrication Sales", "correct": "4000 Product Revenue"},
                {"code": "CB-4200", "name": "Installation & Repair Income", "correct": "4500 Service Revenue"},
                {"code": "CB-5150", "name": "Steel & Consumables Used", "correct": "5000 Cost of Goods Sold"},
                {"code": "CB-6300", "name": "Trade Shows & Advertising", "correct": "6200 Sales & Marketing"},
                {"code": "CB-6800", "name": "General Sundries", "correct": "6900 Other Operating Expense"},
            ],
        },
    ],
}


def get_scenario(category: str, scenario_id: str | None = None, rng: random.Random | None = None) -> dict:
    pool = SCENARIOS.get(category, [])
    if not pool:
        raise KeyError(f"No scenarios for category '{category}'")
    if scenario_id:
        for s in pool:
            if s["id"] == scenario_id:
                return s
        raise KeyError(f"Unknown scenario '{scenario_id}' for '{category}'")
    return (rng or random).choice(pool)
