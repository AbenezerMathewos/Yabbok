$path='C:\Jabbok2\src\app\api\admin\events\[id]\attendees\route.ts'  
$text = Get-Content -LiteralPath $path  
$text = $text -replace 'import { NextResponse } from "next/server";', 'import { NextResponse } from "next/server";`r`nimport type { RouteContext } from "next";'  
Set-Content -LiteralPath $path -Value $text 
