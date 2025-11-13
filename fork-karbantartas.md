# Hosszú távú fork karbantartása -- Git stratégia

Ha hosszú távon karban kell tartanod a saját forkodat, érdemes „rendes"
fork-stratégiát felépíteni, hogy a technikai adósság alacsonyan maradjon
és könnyű legyen upstreamből szinkronizálni.

## 1) Remote-ok beállítása

``` bash
# a saját forkod marad az origin
git remote set-url origin https://github.com/<te>/<repo>.git

# add hozzá az eredetit upstream néven
git remote add upstream https://github.com/<eredeti-szerzo>/<repo>.git
git fetch --all --prune
```

## 2) Branch-stratégia (minimális eltérés)

Tarts két hosszú életű ágat: - `main`: **tiszta mirror** az upstream
`main`-ről (ne told tele saját patchekkel). - `fork/main`: a **te
kiadási ágad**, ide kerülnek az általad karbantartott változtatások.

Inicializálás:

``` bash
# szinkronizáld a main-t tisztára
git checkout main
git reset --hard upstream/main
git push -f origin main

# készíts egy saját főágat a módosításaidnak
git checkout -b fork/main
git push -u origin fork/main
```

## 3) Fejlesztés

-   Új funkcióhoz mindig **topic branch** az aktuális `fork/main`-ről:

    ``` bash
    git checkout fork/main
    git pull
    git checkout -b feat/<rovid-leiras>
    # ... kód, commitok ...
    git push -u origin feat/<rovid-leiras>
    ```

-   PR a `feat/*` ágról **a saját** `fork/main` ágra. Így kapsz
    kódreview-szerű folyamatot még egy egyszemélyes repo esetén is.

## 4) Upstream szinkron (rendszeresen)

Amikor az eredetiben van frissítés:

``` bash
git fetch upstream

# 4.1 tartsd a 'main'-t tükörben
git checkout main
git reset --hard upstream/main
git push -f origin main

# 4.2 rebased a saját főágadat az új upstreamre
git checkout fork/main
git rebase main       # vagy merge, ha azt preferálod
# esetleges konfliktusok megoldása
git push --force-with-lease
```

Tipp: kapcsold be a konfliktusmegoldás memóriát:

``` bash
git config --global rerere.enabled true
```

## 5) Patch-sorozatok karbantartása (opcionális, nagyobb forkoknál)

Ha sok, egymástól független módosításod van, tartsd őket **kis, tiszta
topic branchekben**, és a `fork/main` legyen csak ezek *fast-forward
rebase*-elt összessége.\
Hasznos parancsok: `git cherry-pick`, `git format-patch` + `git am`.

## 6) Kiadás és verziózás (npm-es könyvtárnál)

-   `package.json`:
    -   `name`: pl. `@okoinformatika/jsonforms-vuetify`
    -   `repository`, `bugs`, `homepage` frissítése
    -   `publishConfig: { "access": "public" }`
-   **SemVer**: tartsd az upstream verziót alapnak + saját suffix:
    `3.4.0-okoi.1`.
-   Hasznos: *Changesets* vagy *semantic-release*.

``` bash
npm login
npm publish --access public
```

## 7) CI és automata upstream-sync

Használj GitHub Actions workflow-t, ami hetente szinkronizálja a
`main`-t az upstream-mel, és PR-t nyit a `fork/main` felé.

## 8) Upstream felé visszaemelés

Küldd vissza a hasznos patcheket az eredeti repo-ba kis, tiszta
PR-okban.

## 9) Dokumentáció

-   README-ben jelezd, hogy ez **fork**, és hogyan szinkronizálod.
-   Írd le a „How to update from upstream" lépéseket.

## 10) Lokális fejlesztés

-   `npm link` / `pnpm link` a gyors iterációhoz.
-   Monorepó esetén: workspaces.

------------------------------------------------------------------------

### Gyors parancs-összefoglaló

``` bash
git remote add upstream https://github.com/<eredeti>/<repo>.git
git fetch --all --prune

git checkout main && git reset --hard upstream/main && git push -f origin main
git checkout -b fork/main && git push -u origin fork/main

git checkout fork/main
git checkout -b feat/<valami>
git push -u origin feat/<valami>

git fetch upstream
git checkout main && git reset --hard upstream/main && git push -f origin main
git checkout fork/main && git rebase main && git push --force-with-lease
```
