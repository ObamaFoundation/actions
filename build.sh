for D in *; do
    if [ -f "${D}/package.json" ]; then
        ( cd "$D" && npm run build )
    fi
done
