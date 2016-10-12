# Plot & find K values using Tupper's Self-Referential Formula

## [Live demo](https://mtcliatt.github.io/Everything/)

<p align="center">
<img src="SCREENSHOTS/main.png">
<div align="center"><i>The plot & K-value where Tupper's formula plots itself</i></div>
</p>

## [Live demo](https://mtcliatt.github.io/Everything/)

-------------------

# References

#### [Wikipedia](https://en.wikipedia.org/wiki/Tupper%27s_self-referential_formula)
#### [Numberphile video 1](https://www.youtube.com/watch?v=_s5RFgd59ao) and [Numberphile video 2](https://www.youtube.com/watch?v=wx22jdwn5zQ)
#### [www.tuppers-formula.tk](http://tuppers-formula.tk/)

# Using this application

## [Live demo](https://mtcliatt.github.io/Everything/)

### Or, run the application by cloning the repo and opening `index.html` in a browser.

### Controls

- Generate the plot at a given K value by entering the K value in the input text field and clicking 'Plot graph from K value'

- Generate the K value of a plot by "drawing" the plot and clicking 'Generate K value from graph'

- Click on a grid square to toggle it on/off

- Hold down the left mouse button to turn on multiple squares at once

- Hold down the right mouse button to turn off multiple squares at once

### Note

**This version does not reverse the axes like the Wikipedia version does.**  
**This version follows the method used in the [Numberphile video](https://www.youtube.com/watch?v=_s5RFgd59ao) and on [www.tuppers-formula.tk](http://tuppers-formula.tk/).**
  
  
-------------------

# Tupper's Self-Referential Formula [source = [wiki](https://en.wikipedia.org/wiki/Tupper%27s_self-referential_formula)]

> ## Tupper's self-referential formula is a formula that, when graphed in two dimensions at a specific location in the plane, can be "programmed" to visually reproduce the formula itself.

### History

> It was defined by Jeff Tupper. It is used in various math and computer science courses as an exercise in graphing formulae[citation needed].

> While it is called "self-referential", Tupper did not name it as such.

> The formula was published in his 2001 SIGGRAPH paper discussing methods related to the GrafEq formula-graphing program Tupper developed.

### Formula

<p align="center">
<img src="SCREENSHOTS/formula.png">
<div align="center"><i>The formula is an inequality</i></div>
</p>

> or, as plaintext: 

> `1/2 < floor(mod(floor(y/17)*2^(-17*floor(x)-mod(floor(y), 17)),2))`

> Let k equal the following 543-digit integer:

>     960 939 379 918 958 884 971 672 962 127 852 754 715 004 339 660 129 306 651 505 519 271 702 802 395 266 424 689 642 842 174 350 718 121 267 153 782 770 623 355 993 237 280 874 144 307 891 325 963 941 337 723 487 857 735 749 823 926 629 715 517 173 716 995 165 232 890 538 221 612 403 238 855 866 184 013 235 585 136 048 828 693 337 902 491 454 229 288 667 081 096 184 496 091 705 183 454 067 827 731 551 705 405 381 627 380 967 602 565 625 016 981 482 083 418 783 163 849 115 590 225 610 003 652 351 370 343 874 461 848 378 737 238 198 224 849 863 465 033 159 410 054 974 700 593 138 339 226 497 249 461 751 545 728 366 702 369 745 461 014 655 997 933 798 537 483 143 786 841 806 593 422 227 898 388 722 980 000 748 404 719

> If one graphs the set of points (x, y) in 0 ≤ x < 106 and k ≤ y < k + 17 satisfying the inequality given above, the resulting graph looks like this (the axes in this plot have been reversed, otherwise the picture would be upside-down and mirrored):

<p align="center">
<img src="SCREENSHOTS/plot1.png">
<div align="center"><i>The plot where Tupper's formula plots itself</i></div>
</p>

> The formula is a general-purpose method of decoding a bitmap stored in the constant k, and it could actually be used to draw any other image. When applied to the unbounded positive range 0 ≤ y, the formula tiles a vertical swath of the plane with a pattern that contains all possible 17-pixel-tall bitmaps. One horizontal slice of that infinite bitmap depicts the drawing formula itself, but this is not remarkable, since other slices depict all other possible formulae that might fit in a 17-pixel-tall bitmap. Tupper has furnished extended versions of his original formula that rule out all but one slice ([1], [2], [3]).

> The constant k is a simple monochrome bitmap image of the formula treated as a binary number and multiplied by 17. If k is divided by 17, the least significant bit encodes the upper-right corner (k, 0); the 17 least significant bits encode the rightmost column of pixels; the next 17 least significant bits encode the 2nd-rightmost column, and so on.
