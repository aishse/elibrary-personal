-- Create the database
CREATE DATABASE IF NOT EXISTS elibrary;

-- Use the database
USE elibrary;

-- Create all tables
CREATE TABLE User(
	user_id INTEGER AUTO_INCREMENT PRIMARY KEY,
	username VARCHAR(35) UNIQUE NOT NULL,
	password VARCHAR(50) NOT NULL,
	email VARCHAR(40) UNIQUE NOT NULL,
	join_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE Follower(
	user_id INTEGER,
	follower_id INTEGER,
	PRIMARY KEY (user_id, follower_id),
	FOREIGN KEY (user_id) REFERENCES User(user_id) ON DELETE CASCADE,
	FOREIGN KEY (follower_id) REFERENCES User(user_id) ON DELETE CASCADE
);


CREATE TABLE Book_Club(
	club_id INTEGER AUTO_INCREMENT PRIMARY KEY,
	name VARCHAR(60) UNIQUE NOT NULL,
	moderator INTEGER NOT NULL,
	FOREIGN KEY (moderator) REFERENCES User(user_id) ON DELETE CASCADE
);


CREATE TABLE Book_Club_Membership(
	club_id INTEGER,
	user_id INTEGER,
	PRIMARY KEY (club_id, user_id),
	FOREIGN KEY (club_id) REFERENCES Book_Club(club_id) ON DELETE CASCADE,
	FOREIGN KEY (user_id) REFERENCES User(user_id) ON DELETE CASCADE
);


CREATE TABLE Book(
	isbn_13 VARCHAR(20) PRIMARY KEY,
	title VARCHAR(200) NOT NULL,
	synopsis VARCHAR(1000) NOT NULL,
	language VARCHAR(40),
	edition VARCHAR(20),
	publisher VARCHAR(50),
	publish_date DATE,
	num_pages INTEGER,
	cover VARCHAR(200)
);


CREATE TABLE Bookshelf(
	bookshelf_id INTEGER AUTO_INCREMENT PRIMARY KEY,
	user_id INTEGER NOT NULL,
	name VARCHAR(60) NOT NULL,
	FOREIGN KEY (user_id) REFERENCES User(user_id) ON DELETE CASCADE
);


CREATE TABLE Bookshelf_Contents(
	bookshelf_id INTEGER,
	isbn_13 VARCHAR(20),
	PRIMARY KEY (bookshelf_id, isbn_13),
	FOREIGN KEY (bookshelf_id) REFERENCES Bookshelf(bookshelf_id) ON DELETE CASCADE,
	FOREIGN KEY (isbn_13) REFERENCES Book(isbn_13) ON DELETE CASCADE
);


CREATE TABLE Review(
	review_id INTEGER AUTO_INCREMENT PRIMARY KEY,
	user_id INTEGER,
	isbn_13 VARCHAR(20) NOT NULL,
	publish_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	rating INTEGER NOT NULL,
	text VARCHAR(600) NOT NULL,
	FOREIGN KEY (user_id) REFERENCES User(user_id) ON DELETE SET NULL,
	FOREIGN KEY (isbn_13) REFERENCES Book(isbn_13) ON DELETE CASCADE
);

 
CREATE TABLE Comment(
	comment_ID INTEGER AUTO_INCREMENT PRIMARY KEY,
	user_id INTEGER,
	review_id INTEGER NOT NULL,
	text VARCHAR(600) NOT NULL,
	publish_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (user_id) REFERENCES User(user_id) ON DELETE SET NULL,
	FOREIGN KEY (review_id) REFERENCES Review(review_id) ON DELETE CASCADE
);


CREATE TABLE Borrow(
	user_id INTEGER,
	isbn_13 VARCHAR(20),
	rent_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (user_id, isbn_13),
	FOREIGN KEY (user_id) REFERENCES User(user_id) ON DELETE CASCADE,
	FOREIGN KEY (isbn_13) REFERENCES Book(isbn_13) ON DELETE CASCADE
);

CREATE TABLE Borrowing_History(
	user_id INTEGER,
	isbn_13 VARCHAR(20),
	date_borrowed TIMESTAMP,
	PRIMARY KEY (user_id, isbn_13, date_borrowed),
	FOREIGN KEY (user_id) REFERENCES User(user_id) ON DELETE CASCADE,
	FOREIGN KEY (isbn_13) REFERENCES Book(isbn_13) ON DELETE CASCADE
);


CREATE TABLE Request(
	user_id INTEGER,
	isbn_13 VARCHAR(20),
	request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (user_id, isbn_13),
	FOREIGN KEY (user_id) REFERENCES User(user_id) ON DELETE CASCADE,
	FOREIGN KEY (isbn_13) REFERENCES Book(isbn_13) ON DELETE CASCADE
);


CREATE TABLE Read_Book(
	user_id INTEGER,
	isbn_13 VARCHAR(20),
	current_page INTEGER,
	PRIMARY KEY (user_id, isbn_13),
	FOREIGN KEY (user_id) REFERENCES User(user_id) ON DELETE CASCADE,
	FOREIGN KEY (isbn_13) REFERENCES Book(isbn_13) ON DELETE CASCADE
);


CREATE TABLE Genre(
	name VARCHAR(60) PRIMARY KEY,
	description VARCHAR(500)
);


CREATE TABLE Book_Has_Genre(
	isbn_13 VARCHAR(20),
	name VARCHAR(60) NOT NULL,
	PRIMARY KEY (isbn_13, name),
	FOREIGN KEY (isbn_13) REFERENCES Book(isbn_13) ON DELETE CASCADE,
	FOREIGN KEY (name) REFERENCES Genre(name) ON DELETE CASCADE
);


CREATE TABLE Author(
	author_id INTEGER PRIMARY KEY,
	f_name VARCHAR(50) NOT NULL,
	l_name VARCHAR(50) NOT NULL
);


CREATE TABLE Book_Has_Author(
	isbn_13 VARCHAR(20),
	author_id INTEGER,
	PRIMARY KEY (isbn_13, author_id),
	FOREIGN KEY (isbn_13) REFERENCES Book(isbn_13) ON DELETE CASCADE,
	FOREIGN KEY (author_id) REFERENCES Author(author_id) ON DELETE CASCADE
);


CREATE TABLE Activity_Feed_Post(
	owner_id INTEGER,
	review_id INTEGER,
	PRIMARY KEY (owner_id, review_id),
	FOREIGN KEY (owner_id) REFERENCES User(user_id) ON DELETE CASCADE,
	FOREIGN KEY (review_id) REFERENCES Review(review_id) ON DELETE CASCADE
);


DELIMITER //
-- Create triggers

CREATE TRIGGER Add_Activity_Feed_Post AFTER INSERT
ON Review FOR EACH ROW
BEGIN
	INSERT INTO Activity_Feed_Post (owner_id, review_id)
	SELECT follower_id, NEW.review_id
	FROM Follower
	WHERE NEW.user_id = Follower.user_id;
END//

CREATE TRIGGER Add_Club_Moderator AFTER INSERT
ON Book_CLUB FOR EACH ROW
BEGIN
	INSERT INTO Book_Club_Membership (club_id, user_id)
	SELECT NEW.club_id, NEW.moderator;
END//

CREATE TRIGGER Add_Read_Book AFTER INSERT
ON Borrow FOR EACH ROW
BEGIN
	INSERT INTO Read_Book VALUES
	(NEW.user_id, NEW.isbn_13, 0);
END//

CREATE TRIGGER RETURN_BOOK AFTER DELETE
ON Borrow FOR EACH ROW
BEGIN
	-- Checkout any requests on returned book
	DECLARE requester_id INTEGER;

	-- Add borrowing history
	INSERT INTO Borrowing_History (user_id, isbn_13, date_borrowed)
	SELECT OLD.user_id, OLD.isbn_13, OLD.rent_date;

	SELECT Request.user_id INTO requester_id
	FROM Request
	WHERE Request.isbn_13 = OLD.isbn_13
	ORDER BY request_date
	LIMIT 1;

	-- Check if anyone requested book
	IF requester_id IS NOT NULL THEN
		INSERT INTO Borrow (user_id, isbn_13)
		SELECT requester_id, OLD.isbn_13;
	END IF;

END//

-- Create functions
CREATE FUNCTION num_members(bookclub_id INTEGER) RETURNS INTEGER
DETERMINISTIC
BEGIN
	DECLARE members INTEGER;
	SELECT COUNT(*) INTO members
	FROM Book_Club_Membership
	WHERE Book_Club_Membership.club_id = bookclub_id;
	RETURN members;
END//

CREATE FUNCTION book_rating(book_isbn VARCHAR(20)) RETURNS DECIMAL(2,1)
DETERMINISTIC
BEGIN
	DECLARE rating DECIMAL(2, 1);
	SELECT AVG(Review.rating) INTO rating
	FROM Review
	WHERE Review.isbn_13 = book_isbn;
	RETURN rating;
END//

CREATE FUNCTION available_copies(book_isbn VARCHAR(20)) RETURNS INTEGER
DETERMINISTIC
BEGIN
	DECLARE copies INTEGER;
	SELECT 3 - COUNT(*) INTO copies
	FROM Borrow
	WHERE Borrow.isbn_13 = book_isbn;
	RETURN copies;
END//

CREATE FUNCTION due_date(borrower_id INTEGER, book_isbn VARCHAR(20)) RETURNS TIMESTAMP
DETERMINISTIC
BEGIN
	DECLARE date TIMESTAMP;
	SELECT TIMESTAMPADD(WEEK, 3, rent_date) INTO date
	FROM Borrow
	WHERE Borrow.user_id = borrower_id AND Borrow.isbn_13 = book_isbn;
	RETURN date;
END//

DELIMITER ;

-- Creates indexes

CREATE INDEX name_idx ON Author(f_name, l_name);
CREATE INDEX title_idx ON Book(title);
CREATE INDEX email_idx ON User(email);
CREATE INDEX username_idx ON User(username);
CREATE INDEX owner_idx ON Activity_Feed_Post(owner_id);
CREATE INDEX club_name_idx ON Book_Club(name);

-- Insert book values

INSERT INTO Book (isbn_13, title, synopsis, language, edition, publisher, publish_date, num_pages, cover)
VALUES
('9482956729301', 'Moby Dick', 'The narrator, like his biblical counterpart, is an outcast. Ishmael, who turns to the sea for meaning, relays to the audience the final voyage of the Pequod, a whaling vessel. The ship''s captain Ahab, who Ishmael and his friend Queequeg soon learn is losing his mind. His first-mate, Starbuck, recognizes this problem too, and is the only one throughout the novel to voice his disapproval of the increasingly obsessive behavior of Ahab. Ahab is still recovering from an encounter with a large whale that resulted in the loss of his leg, Moby Dick. The Pequod sets sail, and the crew is soon informed that this journey will be unlike their other whaling missions: this time, despite the reluctance of Starbuck, Ahab intends to hunt and kill the beastly Moby Dick no matter the cost.', 'English', 'Fourth Edition', 'CreateSpace Independent Publishing Platform', '2018-11-06', 378, 'https://m.media-amazon.com/images/I/51aV053NRjL._AC_UF1000,1000_QL80_.jpg'), ('9674017395174', 'Pride and Prejudice', 'Pride and Prejudice is a novel written by British author Jane Austen and published in 1813. Set in rural England, Austen centers her story on a family with five daughters who will not inherit their family''s estate which is entailed to the nearest male relative. Therefore, it is paramount to the family that at least one of the daughters must marry a wealthy man who can provide for the other four sisters. This novel, one of the first of its kind, is considered the original romantic comedy in English literature. The two main characters, Elizabeth Bennet and Mr. Darcy, do not like each other at first but develop feelings for one another throughout the story despite outside forces trying to keep them apart.', 'English', 'Fifth Edition', 'Dover Publications', '2017-01-23', 378, 'https://holistichabitatclt.com/cdn/shop/products/ca5e628793cc4cac6780d240e7f0b6c1483656ea2d6f566e5bde9d3080406a46.jpg?v=1706299630&width=1214'),
('9127596401198', '1984', '1984 is a dystopian novel written by George Orwell published in 1949. As a dystopian novel, it illustrates the unfair and miserable society of Oceania, which is rife with totalitarian practices and constant surveillance. The book was written as a warning of what could happen if people allowed their governments to obtain too much power after Orwell saw what happened to the people in Nazi Germany. The book also demonstrates the ability of governments to alter reality and manipulate facts to suit their narrative.', 'English', 'Third Edition', 'Dover Publications', '2023-04-01', 353, 'https://m.media-amazon.com/images/I/818C5YoQ0GL._UF1000,1000_QL80_.jpg'),
('4840295671928', 'Brave New World', 'Brave New World follows a few characters who live in a seemingly utopian World State metropolis of London. Their society rests on consumerism and collectivism with a rigid caste system. Bernard Marx, a petty and depressive psychiatrist who works for the Hatchery, is sent on a mission to the New Mexico Reservation, where “savages” live. He is accompanied by Lenina Crowne, an attractive fetus technician. On the Reservation, they meet Linda, a former citizen of the World State who had stayed behind, and her son John, born through a viviparous procreation, a scandal in the World State. When Bernard and Lenina bring the two back to London, John serves as the mouthpiece for the conflicts between the Reservation, which still abides by traditional values, and the technocracy of the World State.', 'English', 'Third Edition', 'Harper Perennial', '2006-10-17', 288, 'https://m.media-amazon.com/images/I/71GNqqXuN3L._AC_UF1000,1000_QL80_.jpg'),
('7694763019273', 'Fahrenheit 451', 'Set in the twenty-fourth century, Fahrenheit 451 introduces a new world in which control of the masses by the media, overpopulation, and censorship has taken over the general population. The individual is not accepted and the intellectual is considered an outlaw. Television has replaced the common perception of family. The fireman is now seen as a flamethrower, a destroyer of books rather than an insurance against fire. Books are considered evil because they make people question and think. The people live in a world with no reminders of history or appreciation of the past; the population receives the present from television.', 'English', 'Third Edition', '‎Simon & Schuster', '2012-01-10', 249, 'https://m.media-amazon.com/images/I/61l8LHt4MeL._AC_UF1000,1000_QL80_.jpg'),
('5063402919513', 'Animal Farm', 'Animal Farm is a novel about a group of animals who take control of the farm they live on. The animals get fed up of their master, Farmer Jones, so they kick him out. Once they are free of the tyrant Jones, life on the farm is good for a while and there is hope for a happier future of less work, better education and more food. However, trouble brews as the pigs, Napoleon and Snowball, fight for the hearts and minds of the other animals on the farm. Napoleon seizes power by force and ends up exploiting the animals just as Farmer Jones had done. The novel ends with the pigs behaving and even dressing like the humans the animals tried to get rid of in the first place.', 'English', 'Third Edition', '‎Signet', '2004-04-06', 140, 'https://m.media-amazon.com/images/I/71je3-DsQEL._AC_UF1000,1000_QL80_.jpg'),
('8603759195621', 'Of Mice and Men', 'Of Mice and Men is centred around two itinerant workers, George and Lennie, in California in the 1930s as they start work on a ranch in a place called Soledad (a Spanish word meaning ‘solitude’). The whole story takes place over a period of four days, starting on Thursday evening and ending on Sunday. While at the ranch, George and Lennie meet other characters, who emphasise the loneliness and difficulty of life for the people living and working in these places. Reflecting a period of economic devastation in the United States, Of Mice and Men demonstrates the damaging effects of the Great Depression upon ordinary working men.', 'English', 'Third Edition', '‎Penguin Books', '2004-04-06', 107, 'https://m.media-amazon.com/images/I/71xXwHUrsxL.jpg'),
('7503919285919', 'Island', 'In Island, his last novel, Huxley transports us to a Pacific island where, for 120 years, an ideal society has flourished. Inevitably, this island of bliss attracts the envy and enmity of the surrounding world. A conspiracy is underway to take over Pala, and events begin to move when an agent of the conspirators, a newspaperman named Faranby, is shipwrecked there. What Faranby doesn''t expect is how his time with the people of Pala will revolutionize all his values and—to his amazement—give him hope.', 'English', 'Fourth Edition', '‎Harper Perennial', '2009-10-20', 384, 'https://m.media-amazon.com/images/I/71zv1NFS4qL.jpg'),
('8592910820571', 'The Adventures of Tom Sawyer', 'The novel centers on the mischievous orphan Tom Sawyer, who lives in the quaint village of St. Petersburg, Missouri under the care of his kind Aunt Polly along with his ill-natured brother Sid and angelic cousin Mary. As a collection of stories, the novel is loosely structured, but follows the arc of Tom''s transformation from a rebellious boy who longs to escape authority to a responsible community member committed to respectability.', 'English', 'Fourth Edition', '‎Union Square Kids', '2004-10-01', 224, 'https://m.media-amazon.com/images/I/A1Wad8LO08L.jpg'),
('4860328183491', 'The Adventures of Huckleberry Finn', 'Mark Twain''s classic The Adventures of Huckleberry Finn is told from the point of view of Huck Finn, a barely literate teen who fakes his own death to escape his abusive, drunken father. He encounters a runaway slave named Jim, and the two embark on a raft journey down the Mississippi River.', 'English', 'First Edition', '‎Dover Publications', '2018-12-18', 400, 'https://m.media-amazon.com/images/I/91sBZnKzEfL._AC_UF1000,1000_QL80_.jpg'),
('8679481917514', 'The Scarlet Letter', 'The novel is set in a village in Puritan New England. The main character is Hester Prynn, a young woman who has borne a child out of wedlock. Hester believes herself a widow, but her husband, Roger Chillingworth, arrives in New England very much alive and conceals his identity. He finds his wife forced to wear the scarlet letter A on her dress as punishment for her adultery. After Hester refuses to name her lover, Chillingworth becomes obsessed with finding his identity. Hester herself is revealed to be a self-reliant heroine who is never truly repentant for committing adultery with the minister; she feels that their act was consecrated by their deep love for each other. Although she is initially scorned, over time her compassion and dignity silence many of her critics.', 'English', 'First Edition', '‎CreateSpace Independent Publishing', '2020-12-07', 175, 'https://m.media-amazon.com/images/I/61iylEmE5kL._AC_UF1000,1000_QL80_.jpg'),
('5832841981523', 'The House of the Seven Gables', 'The story of the Pyncheon family, residents of an evil house cursed by the victim of their ancestor''s witch hunt and haunted by the ghosts of many generations. The House of the Seven Gables has been home to many generations of the Pyncheon family, each with their own dramas and tragedies. But all have felt the cold touch of a curse placed upon the house by a man who was hanged for witchcraft, the victim of a Pyncheon ancestor''s greed. This evil house is haunted by the ghosts of its sinful dead, and tortured by the fear of its frightened living. Written as a follow-up to The Scarlet Letter, The House of the Seven Gables draws on Hawthorne''s own family history—an ancestor of his was a judge in the Salem witch trials—and demonstrates a masterful blending of the actual and the imaginary.', 'English', 'Second Edition', '‎SeaWolf Press', '2018-09-04', 294, 'https://m.media-amazon.com/images/I/71KSgWWZsGL._AC_UF1000,1000_QL80_.jpg'),
('2359719283721', 'A Christmas Carol', 'It recounts the story of Ebenezer Scrooge, an elderly miser who is visited by the ghost of his former business partner Jacob Marley and the spirits of Christmas Past, Present and Yet to Come. In the process, Scrooge is transformed into a kinder, gentler man.', 'English', 'First Edition', 'CreateSpace Independent Publishing', '2020-12-04', 64, 'https://m.media-amazon.com/images/I/71OZfi1aXSL._AC_UF1000,1000_QL80_.jpg '),
('7423894738295', 'A Tale of Two Cities', 'The novel tells the story of the French Doctor Manette, his 18-year-long imprisonment in the Bastille in Paris, and his release to live in London with his daughter Lucie whom he had never met. The story is set against the conditions that led up to the French Revolution and the Reign of Terror.', 'English', 'First Edition', 'SeaWolf Press', '1993-02-23', 472, 'https://m.media-amazon.com/images/I/71VK2E8l93L._AC_UF1000,1000_QL80_.jpg'),
('8654891918342', 'The Hobbit', 'The Hobbit is set in Middle-earth and follows home-loving Bilbo Baggins, the hobbit of the title, who joins the wizard Gandalf and the thirteen dwarves of Thorin''s Company, on a quest to reclaim the dwarves'' home and treasure from the dragon Smaug.', 'English', 'First Edition', '‎Harper Perennial', '2014-09-28', 541, 'https://i.harperapps.com/hcuk/covers/9780007270613/x450.JPG '),
('3208493129041', 'Frankenstein', 'Fueled with passion and determination, Victor secretly works long into the night, notating every detail in his journal. Victor succeeds in creating a living being, his Creature. However, Victor''s ideals are ruined when he sees what he has created. The Creature is hideous, unable to function or communicate. The epistolary story follows a scientific genius who brings to life a terrifying monster that torments its creator.', 'English', 'First Edition', '‎CreateSpace Independent Publishing', '2020-12-21', 144, 'https://m.media-amazon.com/images/I/81z7E0uWdtL.jpg'),
('65241436783512', 'Dracula', 'Count Dracula, a 15th-century prince, is condemned to live off the blood of the living for eternity. Young lawyer Jonathan Harker is sent to Dracula''s castle to finalise a land deal, but when the Count sees a photo of Harker''s fiancée, Mina, the spitting image of his dead wife, he imprisons him and sets off for London to track her down.', 'English', 'First Edition', '‎‎Open Road Media', '2014-03-18', 351, 'https://m.media-amazon.com/images/I/91wOUFZCE+L._UF1000,1000_QL80_.jpg'),
('6840328934104', 'To Kill a Mockingbird', 'To Kill a Mockingbird by Harper Lee tells the story of Scout Finch, a young girl growing up in the racially segregated town of Maycomb, Alabama, during the 1930s, as she witnesses her father, Atticus Finch, a lawyer with strong moral principles, defend Tom Robinson, a Black man falsely accused of raping a white woman; through the perspective of Scout, the novel explores themes of racial injustice, prejudice, and the importance of standing up for what is right, even in the face of overwhelming societal pressure, as she and her brother Jem learn valuable lessons about empathy and morality throughout the trial.', 'English', 'Third Edition', '‎‎Harper Perennial', '2002-03-01', 336, 'https://m.media-amazon.com/images/I/81aY1lxk+9L.jpg'),
('3235890234185', 'The Wizard of Oz', 'Dorothy and her dog Toto find themselves in the strange land of Oz after a cyclone hits her Aunt and Uncle''s house in Kansas. To return home, Dorothy must follow the yellow brick road to find the famous Wizard of Oz who lives in the beautiful Emerald City.', 'English', 'First Edition', '‎‎CreateSpace Independent Publishing', '2014-02-03', 92, 'https://m.media-amazon.com/images/I/81svv3An4oL._AC_UF1000,1000_QL80_.jpg'),
('4238088104554', 'Little Women', 'Little Women is a coming-of-age story; a collection of anecdotes illustrating life in Civil War-era America; a pastiche of domestic and didactic fictions; a reflection on living morally and a proto-feminist critique of 19th-century separate spheres ideology. Louisa May Alcott''s novel draws readers into the world of the four March sisters – Meg, Jo, Beth and Amy – and their mother, Marmee, and follows the girls as they grow from impulsive teens into mature young women. Alcott''s novel doesn’t resist sentimentality, but it balances, and, ultimately, transcends it with realistic depictions of the challenges inherent in the pursuit of true vocation and true love, the burden of domestic labor, and the effects of social pressures and life''s challenges, including illness, on female ambition.', 'English', 'Second Edition', '‎‎Penguin Books', '2019-11-19', 480, 'https://m.media-amazon.com/images/I/91j2nOoYm0L.jpg'),
('4892819847507', 'The Three Musketeers', 'This delightful, swashbuckling adventure follows the story of young D''Artagnan as he pursues his dream of becoming a musketeer. He arrives in Paris and finds himself befriended by Athos, Porthos, and Aramis, three experienced musketeers, and they become caught up in political intrigue and court dramas.', 'English', 'Fourth Edition', '‎‎CreateSpace Independent Publishing', '2023-07-26', 783, 'https://m.media-amazon.com/images/I/51i3RXQkYZL._AC_UF1000,1000_QL80_.jpg'),
('37841928734751', 'The Great Gatsby', 'It tells the story of Jay Gatsby, a self-made millionaire, and his pursuit of Daisy Buchanan, a wealthy young woman whom he loved in his youth. Set in 1920s New York, the book is narrated by Nick Carraway. After moving to the fictional West Egg on Long Island, Nick comes to know Gatsby, who asks for his help in reconnecting with Daisy, now married to Tom Buchanan. Gatsby and Daisy rekindle their relationship. Tom discovers the affair and confronts Gatsby, revealing how Gatsby made his fortune selling illegal alcohol. While driving Gatsby’s car, Daisy hits and kills Myrtle Wilson, Tom’s mistress. Myrtle’s husband later kills Gatsby and then himself.', 'English', 'First Edition', '‎Scribner', '2004-09-30', 180, 'https://m.media-amazon.com/images/I/81QuEGw8VPL.jpg'),
('48397287419754', 'The Catcher in the Rye', 'The Catcher in the Rye tells the story of Holden Caulfield, a disillusioned teenage boy expelled from prep school who wanders through New York City, grappling with the phony nature of the adult world and desperately trying to preserve childhood innocence, symbolized by his desire to be a catcher in the rye who protects children from falling off a cliff into adulthood; his journey is marked by alienation, loneliness, and a deep sense of loss following the death of his younger brother, Allie.', 'English', 'First Edition', '‎Little, Brown and Company', '1991-05-01', 240, 'https://m.media-amazon.com/images/I/8125BDk3l9L.jpg'),
('48379587329471', 'Crime and Punishment', 'Crime and Punishment opens with a former law student, Raskolnikov, looking out on the city''s misery from the tiny apartment he can’t afford. Raskolnikov is overwhelmed by hopelessness that he is given up supporting himself. His mother and sister were once respectable people in their country village and he relies on their support to survive. Raskolnikov''s sister Dunya is a beautiful and intelligent woman. However, their family has become so poor she has to endure richer men shamelessly offering to buy her hand in marriage. Raskolnikov meets a hopeless drunk at the local tavern, who describes how his pure-hearted daughter Sonya has been forced into prostitution to support the family. Finally, he emerges with a feverish plan: to murder and rob an old woman who acts as a pawnbroker.', 'English', 'First Edition', '‎Signet', '2006-03-07', 560, 'https://m.media-amazon.com/images/I/71O2XIytdqL._AC_UF1000,1000_QL80_.jpg'),
('6748320814349', 'Ulysses', 'Ulysses by James Joyce follows the lives of Leopold Bloom, a Jewish advertising canvasser, and Stephen Dedalus, a young intellectual, as they navigate through a single day in Dublin, Ireland (June 16, 1904), with their experiences loosely mirroring the Homeric epic The Odyssey, where Bloom parallels Odysseus, Molly Bloom is Penelope, and Stephen represents Telemachus; the novel explores their thoughts, encounters, and inner struggles throughout the day, all while showcasing the intricacies of everyday life in Dublin.', 'English', 'First Edition', '‎Vintage', '1990-06-16', 783, 'https://m.media-amazon.com/images/I/41Rb-Kz6v1L._AC_UF1000,1000_QL80_.jpg'),
('1438005687417', 'Barron''s GRE', 'Barron''s GRE-Galgotia-Galgotia-2016-EDN-21', 'English', '21st Edition', 'Galgotia Publications', '2016-01-01', '205', 'http://ecx.images-amazon.com/images/I/510l0qhi01L.jpg'),
('1351378298437', 'Construction Scheduling: Principles and Practices', 'This text is a comprehensive, stand alone reference for project management scheduling. It features a unique combination of principles/fundamentals of scheduling and project management along with practical applications and tutorials of the 4 most common scheduling software programs–Microsoft Project, Primavera Project Planner (P3), SureTrak, P6 Project Manager and Contractor. Having scheduling information and software instructions in one book obviates the need for two texts, and the exercises and examples in the scheduling portion are tied to the same exercises in the software portions.', 'English', 'Second Edition', 'Pearson', '2008-07-07', '384', 'http://ecx.images-amazon.com/images/I/51PuTPPCxaL.jpg'),
('8986992237528', 'Book of Common Prayer 1979', 'LARGE PRINT, loose-leaf edition of the Book of Common Prayer (1979). Includes burgundy 3 ring binder. This is the COMPLETE 1979 Book of Common Prayer. Perfect for using for a single liturgical service- Eucharist Rite One/Rite Two, Baptism, Confirmation, etc., instead of carrying a full-sized book.', 'English', 'Large Print Edition', 'The Church Hymnal Corporation', '1979-01-12', '1001', 'http://ecx.images-amazon.com/images/I/41xLYt-v6nL.jpg '),
('5965273223261', 'HTML & XHTML: The Definitive Guide', 'This is the single most important book on HTML and XHTML you can own. Bill Kennedy is chief technical officer of MobileRobots, Inc. When not hacking new HTML pages or writing about them, Dr. Bill (Ph.D. in biophysics from Loyola University of Chicago) is out promoting the company''s line of mobile, autonomous robots that can be used for artificial intelligence, fuzzy logic research, and education. Chuck Musciano began his career as a compiler writer and crafter of tools at Harris Corporations Advanced Technology Group and is now a manager of Unix Systems in Harris Corporate Data Center.', 'English', 'Sixth Edition', 'O Reilly Media', '2006-01-01', '680', 'http://ecx.images-amazon.com/images/I/5159f7hqJjL.jpg'),
('1932564462325', 'Shadowrun', 'You are a shadowrunner - a street operative. You may be human or troll, dwarf or elf. You may throw fireballs, pull out your trusty Uzi or slice through computer security with a program as elegant and deadly as a stiletto. No matter what, you get the job done. You are a shadowrunner - a professional. You don''t just survive in the shadows - you thrive there . . .! for now. Shadowrun, Third Edition is a complete rulebook for game masters and players. It contains all the rules needed to create characters and ongoing adventures set in the popular Shadowrun universe. Shadowrun, Third Edition updates, revises, expands and clarifies the rules from previous Shadowrun rulebooks. It is compatible with previous versions of Shadowrun and with previously published Shadowrun source material.', 'English', 'Third Edition', 'Fanpro', '2003-01-01', '334', 'http://ecx.images-amazon.com/images/I/51TLjyIjU%2BL.jpg'),
('1337950204628', 'Principles of Marketing', 'Brand New International Paper-back Edition Same as per description, **Economy edition, May have been printed in Asia with cover stating Not for sale in US. Legal to use despite any disclaimer on cover. Save Money. Contact us for any queries. Best Customer Support! All Orders shipped with Tracking Number', 'English', 'Revised Edition', 'Pearson India ', '2018-01-01', '728', 'http://ecx.images-amazon.com/images/I/51MyuNfkVGL.jpg'),
('7355883413592', 'Disaster Law and Policy', 'Risk and uncertainty in policy making—with reference toe rigor of science with a broad human perspective. All the Myers’ hallmarks are here—the vivid presentation, intense attention to detail and currency in the field, research-based study aids and media learning tools, and above all, the inviting, authorial voice of David Myers that speaks to the life experiences of all kinds of students.', 'English', 'Ninth Edition', 'Worth Publishers', '2012-11-02', '581', 'http://ecx.images-amazon.com/images/I/519HwDb%2BzoL.jpg'),
('7355886001253', 'Property Law: Rules, Policies and Practices', 'Outstanding features of Property Law: Rules, Policies, and Practices, written by Professor Joseph William Singer, a highly regarded authority in the field, include: well-written notes with clear explanations of the law so students can learn complicated rules easily strong coverage of civil rights law (fair housing and public accommodations law) strong coverage of statutes, regulations, and statutory interpretation problem-oriented approach, applying concepts, rules, and doctrines to new situations one might find in practice, with problems updated to be current recent cases and interesting fact situations', 'English', 'Fifth Edition', 'Aspen Publishers', '2010-01-20', '1344', 'http://ecx.images-amazon.com/images/I/41BY6EjThJL.jpg'),
('1566701084272', 'Hazardous Laboratory Chemicals Disposal Guide', 'A perennial bestseller, Hazardous Laboratory Chemicals Di economics, complexity theory, organizational management, and social psychology. Compensation and insurance as means to make victims whole and set the stage for rebuilding— with important updates on post-Katrina litigation and the National Flood Insurance Program Recovery from disaster, including case studies on tornado recovery in Tuscaloosa; earthquake recovery in Christchurch, New Zealand; and flood recovery following Superstorm Sandy International disaster law and recent developments in disaster-risk management, the protection of human rights, and the preservation of ecosystem services.', 'English', 'Second Edition', 'Aspen Publishing', '2015-08-28', '1993', 'http://ecx.images-amazon.com/images/I/41-nm-fpWmL.jpg'),
('1466598689129', 'Mobile & Social Game Design: Monetization Methods and Mechanics', 'The book explores how the gaming sector has changed, including the evolution of free-to-play games on mobile and tablet devices, sophisticated subscription model-based products, and games for social media websites, such as Facebook. It also demystifies the alphabet soup of industry terms that have sprouted up around mobile and social game design and monetization. A major focus of the book is on popular mechanisms for acquiring users and methods of monetizing users. The author explains how to put the right kinds of hooks in your games, gather the appropriate metrics, and evaluate that information to increase the game''s overall stickiness and revenue per user. He also discusses the sale of virtual goods and the types of currency used in games, including single and dual currency models. Each chapter includes an interview with industry leaders who share their insight on designing and producing games, analyzing metrics, and much more.', 'English', 'Second Edition', 'CRC Press', '2014-01-22', '236', 'http://ecx.images-amazon.com/images/I/51wRE04dZ9L.jpg'),
('0967812814815', 'Passing on Bypass Using External CounterPulsation: An FDA Cleared Alternative to Treat Heart Disease Without Surgery, Drugs or Angioplasty', 'Over 58 million Americans have some kind of heart disease. Far too many people are unnecessarily forced into surgery or angioplasty when a safer alternative exists. This book describes External CounterPulsation, which is a painless, non-invasive, successful treatment for patients with heart disease and angina. Pressure cuffs wrapped around a patients legs and hips squeeze the leg muscles in conjunction with the beating of the heart. The idea behind ECP (Medicare and insurance covered), is to boost blood flow to the heart through the natural growth of bypasses around arterial blockages. This amazing treatment even works in bypass failures.', 'English', 'Second Edition', 'Pikes Peak Pr', '37028', '185', 'http://ecx.images-amazon.com/images/I/511TCMQWH0L.jpg'),
('3219104275832', 'Health: The Basics', 'This loose-leaf, three-hole punched version of the textbook gives students the flexibility to take only what they need to class and add their own notes–all at an affordable price.', 'English', '11th Edition', 'Pearson', '2018-01-26', '576', 'http://ecx.images-amazon.com/images/I/516Mn8i0SlL.jpg'),
('1505396603325', 'A Social Security Owner''s Manual: Your Guide to Social Security Retirement, Dependent''s, and Survivor''s Benefits', 'In this age of disappearing pensions and decimated retirement savings accounts, Social Security benefits are becoming more and more important all the time. As the baby boom generation reaches retirement age, we are seeing more and more folks who want to learn how to maximize the Social Security benefits available to them. A Social Security Owner''s Manual was created to help folks better understand all of the options available as they commence this very important benefit. You will learn how your benefits are calculated, how to maximize not only your own benefit but the benefits available to your spouse, and methods for wringing every possible dollar from the available benefit structure.', 'English', '3rd Edition', 'CreateSpace Independent Publishing', '2014-12-06', '182', 'http://ecx.images-amazon.com/images/I/51gYRiiTRIL.jpg'),
('0071664703919', 'The Bond Book: Everything Investors Need to Know About Treasuries, Municipals, GNMAs, Corporates, Zeros, Bond Funds, Money Market Funds, and More', 'The financial crisis of 2008 cause major disruptions to every sector of the bond market and left even the savviest investors confused about the safety of their investments. To serve these investors and anyone looking to explore opportunities infixed-income investing, former bond analystAnnette Thau builds on the features and authority that made the first two editions bestsellers in the thoroughly revised, updated, and expanded third edition of The Bond Book.', 'English', 'Third Edition', 'McGraw Hill', '2010-11-17', '448', 'http://ecx.images-amazon.com/images/I/51iYt-htMkL.jpg'),
('1464111723642', 'Exploring Psychology', 'This new edition provides a state-of-the-art introduction to psychology that merges thsposal Guide, Third Edition includes individual entries for over 300 compounds. The extensive list of references has been updated and includes entries for 15 pesticides commonly used in greenhouses. Emphasis is placed on disposal methods that turn hazardous waste material into non-toxic products. These methods fall into several categories, including acid/base neutralization, oxidation or reduction, and precipitation of toxic ions as insoluble solids. The text also provides data on hazardous reactions of chemicals, assisting laboratory managers in developing a plan of action for emergencies such as the spill of any of the chemicals listed.', 'English', 'Second Edition', 'CRC Press', '2003-02-27', '588', 'http://ecx.images-amazon.com/images/I/41KxQK4tjcL.jpg'),
('8408135457321', 'Lonely Planet Nueva Zelanda (Travel Guide)', 'Spanish language edition of Lonely Planet''s New Zealand 19', 'Spanish', 'Spanish Edition', 'Lonely Planet', '2019-01-29', '704', 'http://ecx.images-amazon.com/images/I/51kB37HQ-FL.jpg'),
('1589805062963', 'Cruising Guides: Cruising Guide to Western Florida', 'Western Florida offers a tranquil alternative to the fast paced lifestyle of the eastern coast, and Young leaves nothing unexplored in the waters from Flamingo to the Big Bend. This edition includes specific way points for anchorages and marinas as well as ratings and fees for transient dockage. Intriguing historical profiles and coastal folklore give visitors the flavor of the region, while sections on unsafe areas and shoals help cruisers avoid dangerous waters.', 'English', 'Seventh Edition', 'Pelican Publishing', '2008-02-15', '560', 'http://ecx.images-amazon.com/images/I/51P7BW8CoiL.jpg'),
('1593600690124', 'Open Road''s Best of Honduras', 'Our 2nd Edition gives readers a small number of great choices to anywhere in Honduras. Great ideas are offered for jungle eco touring, combing through ancient ruins along the Ruta Maya, visiting old colonial churches and villages, and relaxing on beautiful pristine beaches. We combine different kinds of trips for our readers, based on the amount of time they have, such as a one-week ruins-and-recreation combo featuring the monumental Copan and other Mayan sites with some city nightlife in the capital of Tegucigalpa, and plenty of ideas for the Bay Islands for some of the best diving and snorkeling in this hemisphere! Best of all, we don''t weigh readers down with tons of useless information – we cut to the chase and give readers short descriptions of the best Honduras has to offer.', 'English', 'First Edition', 'Open Road', '2016-04-26', '264', 'http://ecx.images-amazon.com/images/I/517QC0AE5BL.jpg'),
('1418051918324', 'Hotel, Restaurant, and Travel Law', 'For students and practicing professionals in hospitality, travel and tourism as well as specialized paralegal work, Hotel, Restaurant and Travel Law: A Preventative Approach, 7th Edition, addresses legal issues confronted by managers in the hotel, restaurant, travel and casino industries. The emphasis is on prevention of legal violations. By reading the book, managers can appreciate and identify what actions and precautions are necessary to avoid, or at least minimize, the number of lawsuits. The book uses the case method, long recognized as a helpful approach to learning the often-complicated discipline of law. Readers will study decisions from actual cases in which hospitality establishments were sued, as well as what legal precedents were cited.', 'English', 'Seventh Edition', 'Study Guide Only', '2008-01-01', '744', 'http://ecx.images-amazon.com/images/I/51yA2devJ4L.jpg'),
('1309908743236', 'Essentials for Today Nursing Assistant', 'Safety and Accident Prevention. First Aid and Emergency Care. Communication Skills. Communicating with Coworkers. Anatomy and Physiology. Common Health Problems. Life Cycle. Basic Needs of Patients. Rehabilitation and Restorative Care. The Patient''s Unit. Bedmaking. Admissions, Transfers, and Discharge. Moving and Positioning. Ambulation and Exercise. Personal care and Hygiene. Measuring Vital Signs. Nutrition and Fluids. Elimination. Special Care and Procedures. The Geriatric Patient. The Dying Patient. Dementia and Alzheimer Disease. The Patient with HIV (Human Immunodeficiency Virus) Infection. The Surgical Patient. Maternal and Child Health. Subacute Care. The Home Health Aide. Homemaking Skills. Employability Skills. Surveys and Accreditation. For Nursing Assistants, Home Health Aides, Patient Care Assistants, ALF Caregivers, and LPNs. Previously announced in 7/02 catalog.', 'English', 'Special Edition', 'Pearson', '2003-01-01', '505', 'http://ecx.images-amazon.com/images/I/51ZAP92NKAL.jpg'),
('1457606713142', 'Rereading America: Cultural Contexts for Critical Thinking and Writing', 'Unlike other multicultural composition readers that settle for representing the plurality of American voices and cultures, Rereading America encourages students to grapple with the real differences in perspectives that arise in our complex society. With extensive editorial apparatus that puts readings from the mainstream into conversation with readings from the margins, Rereading America provokes students to explore the foundations and contradictions of our dominant cultural myths. The print text is now integrated with e-Pages for Rereading America, designed to take advantage of what the Web can do.', 'English', 'Ninth Edition', 'Bedford/St. Martin s', '2013-04-19', '775', 'http://ecx.images-amazon.com/images/I/513rw3NG0FL.jpg'),
('7826326336918', 'Glencoe Health', 'Glencoe Health is a comprehensive health program, provided in a flexible format, designed to improve health and wellness among high school students. Real-life application of health skills helps students apply what they learn in health class toward practicing good health behavior in the real world. Hands-on features are integrated with technology, assessment, and up-to-date health content.', 'English', 'Student Edition', 'McGraw Hill', '2010-01-21', '896', 'http://ecx.images-amazon.com/images/I/51I0lovMQEL.jpg'),
('8041260462309', 'Cracking the GRE with 4 Practice Tests', 'The Princeton Review Gets Results. Get All The Prep You Need To Score A Perfect 340 On The Gre With 4 Full-length Practice Tests, Thorough Topic Reviews, Targeted Gre Test-taking Strategies, And Extra Practice Online. This Ebook Edition Has Been Specially Formatted For On-screen Viewing With Cross-linked Questions, Answers, And Explanations. Techniques That Actually Work. Powerful Tactics To Help Avoid Traps And Beat The Test. Step-by-step Problem-solving Guides. 9 Strategies To Maximize Time And Minimize Errors Everything You Need To Know To Help Achieve A High Score. Expert Subject Review For All Test Topics. Bulleted Chapter Summaries For Quick Review. Extensive Gre Vocabulary List Featuring Key Terms And Exercises Practice Your Way To Excellence. 2 Full-length Practice Tests With Detailed Answer Explanations In The Book. 2 Additional Full-length Practice Tests Online. Drills For Each Test Section—verbal, Math, And Writing. Thorough Score Reports For Online Tests', 'English', '2016 Edition', 'Princeton Preview', '2015-01-01', '512', 'http://ecx.images-amazon.com/images/I/51LsBmGbIvL.jpg'),
('7835525054253', 'The Medical Advisor: The Complete Guide to Alternative & Conventional Treatments', 'A guide to family health care covers alternative and conventional treatments for hundreds of health problems, from relatively benign conditions to the most serious diseases', 'English', 'Home Edition', 'Timeline Education', '1997-01-01', '960', 'http://ecx.images-amazon.com/images/I/71E4EYYPHEL.gif'),
('1840760843242', 'Eye Care in Developing Nations', 'The number of the millions of blind in the world continues to grow, causing needless social and economic deprivation. Most of these blind can be cured, and much of the remainder prevented if all people had access to the simple and effective interventions that already exist. ', 'English', 'Fourth Edition', 'CRC Press', '2007-01-01', '272', 'http://ecx.images-amazon.com/images/I/51F9emlD1BL.jpg'),
('7570037027631', 'The Natural Prostate Cure', 'By the age of fifty, three out of four men have enlarged prostates, which can lead to serious health problems, including prostate cancer. The Natural Prostate Cure provides unique and effective alternatives to traditional treatments such as surgery and chemotherapy. The author begins with a lesson in nutrition and the best supplements to take for prostate health. He then details the causes of and natural treatments for common prostate disorders. Finally, he discusses natural hormone treatments that can prevent and combat prostate disease.', 'English', 'Second Edition', 'Square One', '2012-02-22', '144', 'http://ecx.images-amazon.com/images/I/51BQxGcPIzL.jpg'),
('1335481983156', 'Understanding and Managing Diversity: Readings, Cases, and Exercises', 'Provide Students with an Accessible Format: Information is presented in a logical succession to help students learn that is in a way accessible to them. Present New and Timely Diversity Topics: Topics include Racial Identity, Work-Life Balance, Diversity Leadership, and Workplace Communication. Stimulate Critical Thinking about Managing Diversity: A Best Practices feature provides examples of successful innovations.', 'English', 'Sixth Edition', 'Pearson', '2014-06-04', '432', 'http://ecx.images-amazon.com/images/I/51dX%2Bb9NoyL.jpg'),
('1284038031568', 'Pharmacology For The Prehospital Professional', 'The only problem-based approach to prehospital pharmacology! Gain a complete, practical understanding of pharmacology for the most effective patient care in prehospital settings with this innovative resource. Pharmacology for the Prehospital Professionals provides a unique problem-based approach to the administration techniques you need to provide quality prehospital emergency medical care. Clinical scenarios present case information just as you will learn it in the classroom and encounter it in the field, and help you develop problem-solving skills using the same methods applied in real prehospital settings.', 'English', 'Revised Edition', 'Jones & Bartlett Learning', '2012-11-05', '456', 'http://ecx.images-amazon.com/images/I/51YSrJhd%2ByL.jpg'),
('1557882173147', 'Mable Hoffman''s Crockery Cookery', 'Slow cooking is different and requires special recipes. Mable developed every recipe specially for slow-cooking pots. Everyone has been tested and retested to bring you sure success with each meal you prepare. You will see how your slow-cooking pot invites culinary creativity. Just use these recipes as a foundation and add a little pinch of your own ingenuity to the pot.', 'English', 'Revised Edition', 'HP Books', '1995-10-01', '239', 'http://ecx.images-amazon.com/images/I/51-fLL2WhqL.jpg');
  	 
-- Insert author values

INSERT INTO Author (author_id, f_name, l_name)
VALUES
(4013, 'Herman', 'Melville'),
(2418, 'Jane', 'Austen'),
(5535, 'George', 'Orwell'),
(3401, 'Aldous', 'Huxley'),
(9149, 'Ray', 'Bradbury'),
(6410, 'John', 'Steinbeck'),
(9911, 'Mark', 'Twain'),
(9473, 'Nathaniel', 'Hawthorne'),
(2321, 'Charles', 'Dickens'),
(8123, 'J.R.R.', 'Tolkien'),
(1877, 'Mary', 'Wollstonecraft Shelley'),
(9271, 'Bram', 'Stoker'),
(4496, 'Harper', 'Lee'),
(2277, 'L. Frank', 'Baum'),
(7744, 'Louisa May', 'Alcott'),
(7802, 'Alexandre', 'Dumas'),
(1607, 'F. Scott', 'Fitzgerald'),
(6998, 'J.D.', 'Salinger'),
(9893, 'Fyodor', 'Dostoevsky'),
(5113, 'James', 'Joyce'),
(8347, 'Ira K.', 'Wolf'),
(5123, 'Sharon Weiner', 'Green'),
(4298, 'Jay S.', 'Newitt'),
(3916, 'Episcopal', 'Church'),
(7092, 'Chuck', 'Musciano'),
(8251, 'Bill', 'Kennedy'),
(2034, 'Robert N.', 'Charrette'),
(4902, 'Tom', 'Dowd'),
(1437, 'Paul', 'Hume'),
(3189, 'Philip', 'Kotler'),
(2754, 'Gary', 'Armstrong'),
(4568, 'Robert R.', 'Keane'),
(9265, 'Gavin C. C.', 'Ewing'),
(7634, 'Richard P. K. D.', 'Stone'),
(6214, 'Geoffrey P. M. L.', 'McKeown'),
(3719, 'Mike', 'Piper'),
(6392, 'Annette', 'Thau'),
(8537, 'David', 'Myers'),
(5723, 'Joseph William', 'Singer'),
(7482, 'Daniel A.', 'Vallero'),
(1934, 'Lonely', 'Planet'),
(4698, 'Nancy C.', 'Young'),
(5641, 'Charlie', 'Morris'),
(6732, 'Stephen C.', 'Barth'),
(7821, 'M. P.', 'Redding'),
(8493, 'Gary', 'Colombo'),
(9157, 'Bonnie', 'Lisle'),
(1203, 'Robert', 'Cullen'),
(3129, 'McGraw Hill', 'Education'),
(4158, 'The Princeton', 'Review'),
(5269, 'Timeline', 'Education'),
(6374, 'Larry', 'Schwab'),
(8496, 'James L.', 'Smith'),
(9543, 'Pearson', 'Publishing'),
(6721, 'Jones & Bartlett', 'Learning'),
(8593, 'HP', 'Books');

-- Insert book_has_author values

INSERT INTO Book_Has_Author (isbn_13, author_id)
VALUES
('9482956729301', 4013),
('9674017395174', 2418),
('9127596401198', 5535),
('4840295671928', 3401),
('7694763019273', 9149),
('5063402919513', 5535),
('8603759195621', 6410),
('7503919285919', 3401),
('8592910820571', 9911),
('4860328183491', 9911),
('8679481917514', 9473),
('5832841981523', 9473),
('2359719283721', 2321),
('7423894738295', 2321),
('8654891918342', 8123),
('3208493129041', 1877),
('65241436783512', 9271),
('6840328934104', 4496),
('3235890234185', 2277),
('4238088104554', 7744),
('4892819847507', 7802),
('37841928734751', 1607),
('48397287419754', 6998),
('48379587329471', 9893),
('6748320814349', 5113),
('1438005687417', 8347),
('1438005687417', 5123),
('1351378298437', 4298),
('8986992237528', 3916),
('5965273223261', 7092),
('5965273223261', 8251),
('1932564462325', 2034),
('1932564462325', 4902),
('1932564462325', 1437),
('1337950204628', 3189),
('1337950204628', 2754),
('7355883413592', 4568),
('1466598689129', 9265),
('0967812814815', 7634),
('3219104275832', 6214),
('1505396603325', 3719),
('0071664703919', 6392),
('1464111723642', 8537),
('7355886001253', 5723),
('1566701084272', 7482),
('8408135457321', 1934),
('1589805062963', 4698),
('1593600690124', 5641),
('1418051918324', 6732),
('1309908743236', 7821),
('1457606713142', 8493),
('1457606713142', 9157),
('1457606713142', 1203),
('7826326336918', 3129),
('8041260462309', 4158),
('7835525054253', 5269),
('1840760843242', 6374),
('7570037027631', 8496),
('1335481983156', 9543),
('1284038031568', 6721),
('1557882173147', 8593);

-- Insert genre values

INSERT INTO Genre (name, description)
VALUES
('Literary Fiction', 'Literary fiction novels are considered works with artistic value and literary merit. They often include political criticism, social commentary, and reflections on humanity. Literary fiction novels are typically character-driven, as opposed to being plot-driven, and follow a character''s inner story. Learn more about writing fiction in James Patterson''s MasterClass.'),
('Mystery', 'Mystery novels, also called detective fiction, follow a detective solving a case from start to finish. They drop clues and slowly reveal information, turning the reader into a detective trying to solve the case, too. Mystery novels start with an exciting hook, keep readers interested with suspenseful pacing, and end with a satisfying conclusion that answers all of the reader''s outstanding questions.'),
('Thriller', 'Thriller novels are dark, mysterious, and suspenseful plot-driven stories. They very seldom include comedic elements, but what they lack in humor, they make up for in suspense. Thrillers keep readers on their toes and use plot twists, red herrings, and cliffhangers to keep them guessing until the end. Learn how to write your own thriller in Dan Brown’s MasterClass.'),
('Horror', 'Horror novels are meant to scare, startle, shock, and even repulse readers. Generally focusing on themes of death, demons, evil spirits, and the afterlife, they prey on fears with scary beings like ghosts, vampires, werewolves, witches, and monsters. In horror fiction, plot and characters are tools used to elicit a terrifying sense of dread. R.L. Stine’s MasterClass teaches tips and tricks for horror writing.'),
('Historical', 'Historical fiction novels take place in the past. Written with a careful balance of research and creativity, they transport readers to another time and place—which can be real, imagined, or a combination of both. Many historical novels tell stories that involve actual historical figures or historical events within historical settings.'),
('Romance', 'Romantic fiction centers around love stories between two people. They are lighthearted, optimistic, and have an emotionally satisfying ending. Romance novels do contain conflict, but it does not overshadow the romantic relationship, which always prevails in the end.'),
('Western', 'Western novels tell the stories of cowboys, settlers, and outlaws exploring the western frontier and taming the American Old West. They’re shaped specifically by their genre-specific elements and rely on them in ways that novels in other fiction genres don’t. Westerns are not as popular as they once were; the golden age of the genre coincided with the popularity of western films in the 1940s, ''50s, and ''60s.'),
('Bildungsroman', 'Bildungsroman is a literary genre of stories about a character growing psychologically and morally from their youth into adulthood. Generally, they experience a profound emotional loss, set out on a journey, encounter conflict, and grow into a mature person by the end of the story. Literally translated, a bildungsroman is a novel of education or a novel of formation. Judy Blume’s MasterClass teaches more about.'),
('Speculative Fiction', 'Speculative fiction is a supergenre that encompasses a number of different types of fiction, from science fiction to fantasy to dystopian. The stories take place in a world different from our own. Speculative fiction knows no boundaries; there are no limits to what exists beyond the real world. Learn more about speculative fiction in Margaret Atwood''s MasterClass.'),
('Science Fiction', 'Sci-fi novels are speculative stories with imagined elements that do not exist in the real world. Some are inspired by hard natural sciences like physics, chemistry, and astronomy; others are inspired by soft social sciences like psychology, anthropology, and sociology. Common elements of sci-fi novels include time travel, space exploration, and futuristic societies.'),
('Fantasy', 'Fantasy novels are speculative fiction stories with imaginary characters set in imaginary universes. They are inspired by mythology and folklore and often include elements of magic. The genre attracts both children and adults; well-known titles include Alice''s Adventures in Wonderland by Lewis Carroll and the Harry Potter series by J.K. Rowling. Learn more about character and worldbuilding in Neil Gaiman''s MasterClass.'),
('Dystopian', 'Dystopian novels are a genre of science fiction. They are set in societies viewed as worse than the one in which we live. Dystopian fiction exists in contrast to utopian fiction, which is set in societies viewed as better than the one in which we live. Margaret Atwood''s MasterClass teaches elements of dystopian fiction.'),
('Magical Realism', 'Magical realism novels depict the world truthfully, plus add magical elements. The fantastical elements are not viewed as odd or unique; they are considered normal in the world in which the story takes place. The genre was born out of the realist art movement and is closely associated with Latin American authors.'),
('Realist Literature', 'Realist fiction novels are set in a time and place that could actually happen in the real world. They depict real people, places, and stories in order to be as truthful as possible. Realist works of fiction remain true to everyday life and abide by the laws of nature as we currently understand them.'),
('Nonfiction', 'Nonfiction is a genre of literature based on facts, actual events, or real people. It is generally contrasted with fiction, a genre of literature that describes imaginary settings, events, and characters.');

-- Insert book_has_genre values

INSERT INTO Book_Has_Genre (isbn_13, name)
VALUES
('9482956729301', 'Literary Fiction'),
('9674017395174', 'Literary Fiction'),
('9674017395174', 'Romance'),
('9127596401198', 'Dystopian'),
('9127596401198', 'Speculative Fiction'),
('4840295671928', 'Dystopian'),
('4840295671928', 'Science Fiction'),
('7694763019273', 'Dystopian'),
('5063402919513', 'Speculative Fiction'),
('8603759195621', 'Literary Fiction'),
('7503919285919', 'Dystopian'),
('8592910820571', 'Literary Fiction'),
('4860328183491', 'Literary Fiction'),
('8679481917514', 'Literary Fiction'),
('5832841981523', 'Literary Fiction'),
('2359719283721', 'Literary Fiction'),
('7423894738295', 'Historical'),
('8654891918342', 'Fantasy'),
('3208493129041', 'Horror'),
('3208493129041', 'Science Fiction'),
('65241436783512', 'Horror'),
('6840328934104', 'Literary Fiction'),
('3235890234185', 'Fantasy'),
('4238088104554', 'Literary Fiction'),
('4892819847507', 'Historical'),
('37841928734751', 'Literary Fiction'),
('48397287419754', 'Literary Fiction'),
('48379587329471', 'Literary Fiction'),
('6748320814349', 'Literary Fiction'),
('1438005687417', 'Nonfiction'),
('1351378298437', 'Nonfiction'),
('8986992237528', 'Nonfiction'),
('5965273223261', 'Nonfiction'),
('1932564462325', 'Science Fiction'),
('1337950204628', 'Nonfiction'),
('7355883413592', 'Nonfiction'),
('1466598689129', 'Nonfiction'),
('0967812814815', 'Nonfiction'),
('3219104275832', 'Nonfiction'),
('1505396603325', 'Nonfiction'),
('0071664703919', 'Nonfiction'),
('1464111723642', 'Nonfiction'),
('7355886001253', 'Nonfiction'),
('1566701084272', 'Nonfiction'),
('8408135457321', 'Nonfiction'),
('1589805062963', 'Nonfiction'),
('1593600690124', 'Nonfiction'),
('1418051918324', 'Nonfiction'),
('1309908743236', 'Nonfiction'),
('1457606713142', 'Nonfiction'),
 ('7826326336918', 'Nonfiction'),
('8041260462309', 'Nonfiction'),
('7835525054253', 'Nonfiction'),
('1840760843242', 'Nonfiction'),
('7570037027631', 'Nonfiction'),
('1335481983156', 'Nonfiction'),
('1284038031568', 'Nonfiction'),
('1557882173147', 'Nonfiction');

INSERT INTO User (username, email, password) VALUES
('john_doe', 'john.doe@example.com', 'password123'),
('jane_smith', 'jane.smith@example.com', 'securepass456'),
('charlie_brown', 'charlie.brown@example.com', 'charlie2024'),
('alice_wonder', 'alice.wonder@example.com', 'Wonderland789'),
('bob_builder', 'bob.builder@example.com', 'CanWeFixIt1'),
('emily_rose', 'emily.rose@example.com', 'RoseGarden12'),
('david_tennant', 'david.tennant@example.com', 'DoctorWho2024'),
('clara_oswald', 'clara.oswald@example.com', 'ImpossibleGirl33'),
('mike_tyson', 'mike.tyson@example.com', 'BoxerLife77'),
('linda_johnson', 'linda.johnson@example.com', 'SunshineDay123'),
('peter_parker', 'peter.parker@example.com', 'SpideyRules'),
('tony_stark', 'tony.stark@example.com', 'IronMan3000'),
('natasha_romanoff', 'natasha.romanoff@example.com', 'BlackWidow007'),
('steve_rogers', 'steve.rogers@example.com', 'Cap4Ever'),
('bruce_banner', 'bruce.banner@example.com', 'HulkSmash!'),
('diana_prince', 'diana.prince@example.com', 'WonderWoman2024'),
('clark_kent', 'clark.kent@example.com', 'ManOfSteel01'),
('barry_allen', 'barry.allen@example.com', 'FastestMan'),
('arthur_curry', 'arthur.curry@example.com', 'Aquaman!'),
('wanda_maximoff', 'wanda.maximoff@example.com', 'ScarletWitch');

INSERT INTO Book_Club (name, moderator) VALUES
("Fantasy <3", 4),
("All hail the mystery genre", 6),
("Non-fiction lovers", 9),
("Who?", 15),
("BOOK LOVERS", 1),
("There goes all my time", 3),
("MAKE FRIENDS HERE v", 11),
("I need recs ASAP", 1),
("Anishka is cool", 4);