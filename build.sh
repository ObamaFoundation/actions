for D in *; do
    if [ -f "${D}/package.json" ]; then
        ( cd "$D" && npm run all )
    fi
done
