#!/usr/bin/env bash
IDS="71qKZ4uZ-sL 71Zy0xOjJfL 71oJ5k3Q4TL 61Qmx8vJ3EL 71e8fKZ9N-L 61iW9VqvU+L 71D9lCCxGBL 71YjDGWuHbL 71vhT8MfOaL 71Qe5dJFD5L 71dKXdFJp5L 71YxDHOGi4L 71kN5cRSD0L 71HqV-RqbwL 71YOQ1zWJIL 71zcRVmPURL 81jT1Q7yURL 81HnY6WDPBL 41sGJuCWKFL 71kR2bSKPdL 71Rk9xk5mXL 71fecWaWt3L 81zUpKoyQQL 71ieo4E7NwL 611248fNOPL 71QfR2vTfNL 71bQ2QTKXEL 61Y8bMZVM3L 71nCg0CQZAL 812EjwRoL1L 51NBmlCv93L 71EN6D5To0L 618nihcDghL 71amHPKTNgL 710f5FrvB8L 71uA2ukmS-L 61cwukK4epL 51bFvAzzqHL 71nO9rMgURL 61Kzb9p0TkL"
BAD=""
for id in $IDS; do
  # URL-encode the +
  eid=${id//+/%2B}
  code=$(curl -s -o /dev/null -w "%{http_code}" "https://m.media-amazon.com/images/I/${eid}._AC_SL1500_.jpg")
  if [ "$code" != "200" ]; then
    echo "BAD $id $code"
    BAD="$BAD $id"
  fi
done
[ -z "$BAD" ] && echo "ALL OK" || echo "BAD: $BAD"
