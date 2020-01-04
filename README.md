This will require you fiddle with the code to match your setup.
Basic function
1) I read my kodi database to get a list of movies I already have.
2) Go to IMDB with a movie and get all the lists (see note) that contain this movie
3) Go back there and get all the movies in one of the lists you found.
4) Compare your kodi list with their list. If you have about 80 movies in common and their list is about 20% made up of the common movies, you're pretty sure that the list is a legit bad movie list.
Some people add tons of good and bad movies to their lists and this would throw my search off if I included them.

I save all the work in 3 JSON files. So a rerun would not start from scratch
1) list of movies that I have already pulled all the lists. Basically a progress of my kodi db
2) a list of lists. duplicates removed.
3) the same list as 2 above but it now contains all the movies that each list has. 



Note:
IMDB lists page does break with a 404 often. I don't cater for this in code. I just rerun it after a little while.
