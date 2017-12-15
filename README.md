# shiki-ml
A markup language describing mathematical formulae by ASCII art.

## Example
The well-known quadratic formula markup by shiki-ml:
```
              __________
             /  2
      -b +- v  b  - 4ac
 x = --------------------
             2a
```

![tex](img/README.0001.png)

Taylor series of sin:
```
           oo      n 2n+1
        ---    (-1) x
sin x =  >     ----------
        ---     (2n+1)!
           n=0
```

![tex](img/README.0002.png)

Boltzmann's entropy formula:
```
 S = k  ln W
      B
```

![tex](img/README.0003.png)

Newton's equations of motion:
```
           2
          d *r*
 m*a* = m------- = *F*
             2
           dt
```

![tex](img/README.0004.png)

Gauss' law of electromagnetism:
```
  /\ /\                         /\ /\ /\
  |  |   \epsilon *E* . d*S* =  |  |  |   \rho dV = Q
 \/ \/ S                       \/ \/ \/ V
```

![tex](img/README.0005.png)

## Install
```
npm install shikiml
```

## How to use
Type this command by command line.
```
shikiml scaffold
```

Answer some questions and you will get scaffold of an HTML page using shikiml.

## License
MIT

