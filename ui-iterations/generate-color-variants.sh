#!/bin/bash

# Base HTML template
BASE_FILE="/Users/itsukiokamoto/threadstep/ui-iterations/dashboard-sidebar-v1.html"
OUTPUT_DIR="/Users/itsukiokamoto/threadstep/ui-iterations"

# Color variants
declare -A variants=(
    ["classic-blue"]="#3B82F6|#2563EB|#EFF6FF|#BFDBFE|#DBEAFE|Classic Blue"
    ["ocean-blue"]="#0EA5E9|#0284C7|#F0F9FF|#BAE6FD|#E0F2FE|Ocean Blue"
    ["deep-blue"]="#1E40AF|#1E3A8A|#EEF2FF|#A5B4FC|#C7D2FE|Deep Blue"
    ["sky-blue"]="#60A5FA|#3B82F6|#F0F9FF|#DBEAFE|#E0F2FE|Sky Blue"
    ["indigo-blue"]="#4F46E5|#4338CA|#EEF2FF|#C7D2FE|#E0E7FF|Indigo Blue"
)

for variant in "${!variants[@]}"; do
    IFS='|' read -r primary hover light border bg name <<< "${variants[$variant]}"
    
    output_file="$OUTPUT_DIR/dashboard-$variant.html"
    
    # Copy base file and replace colors
    sed -e "s/#3B82F6/$primary/g" \
        -e "s/#2563EB/$hover/g" \
        -e "s/#EFF6FF/$light/g" \
        -e "s/#BFDBFE/$border/g" \
        -e "s/#DBEAFE/$bg/g" \
        -e "s/ThreadStep - Dashboard (Sidebar)/ThreadStep - $name/g" \
        "$BASE_FILE" > "$output_file"
    
    echo "✅ Generated: $output_file"
done

echo ""
echo "🎨 All color variants generated successfully!"
