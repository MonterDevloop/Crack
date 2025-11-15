# Controlling Cell Width in FPDF Tables

When you render tables with FPDF you have to specify the width for *every* `Cell()` call.
If the width argument is missing, FPDF reuses the width from the previous call, which can
make cells appear to "have no width" when the previous value was zero. The snippet below
shows how to explicitly configure the widths for the running number, student name, score,
and grade cells so that the output always lines up.

```php
$widths = [
    'index'   => 5,
    'name'    => 18,
    'score'   => 10,
    'grade'   => 9,
];

foreach ($data_student_subject as $studentName => $subjects) {
    $pdf->SetXY($startX, $currentY);

    $pdf->Cell($widths['index'], $rowHeight, $count++, 1, 0, 'C');
    $pdf->Cell($widths['name'], $rowHeight, $studentName, 1, 0, 'L');

    foreach ($data_subjects as $subject) {
        $scoreText = '-';

        if (isset($subjects[$subject])) {
            $score = $subjects[$subject][0];
            $scoreText = $score['Grade'];
            $pdf->Cell($widths['score'], $rowHeight, $score['Score100'], 1, 0, 'C');
        } else {
            $pdf->Cell($widths['score'], $rowHeight, '', 1, 0, 'C');
        }

        $pdf->SetFillColor(169, 169, 169);
        $pdf->Cell($widths['grade'], $rowHeight, $scoreText, 1, 0, 'C', true);
    }

    $currentY += $rowHeight;
}
```

In this version each call to `Cell()` receives a width from the `$widths` array. Feel free
to tweak the numbers to match the layout you want.
