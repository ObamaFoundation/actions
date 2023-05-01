for d in [a-z]*
do
  ( cd "$d" && npm run build )
done
